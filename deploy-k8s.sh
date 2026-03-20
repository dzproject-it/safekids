#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# deploy-k8s.sh — Déploiement K8s des projets SafeKids + PaperAtlas-dz
#                  sur la machine distante 87.106.4.161 (k3s)
# ═══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────────────
REMOTE_HOST="87.106.4.161"
REMOTE_USER="${REMOTE_USER:-root}"
SSH_OPTS="-o StrictHostKeyChecking=accept-new -o ConnectTimeout=10"
SSH_CMD="ssh ${SSH_OPTS} ${REMOTE_USER}@${REMOTE_HOST}"
SCP_CMD="scp ${SSH_OPTS}"

# Répertoires projets (relatifs au parent de ce script)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SAFEKIDS_DIR="${SCRIPT_DIR}"
PAPERATLAS_DIR="${SCRIPT_DIR}/../PaperAtlas-dz"

# Images Docker
SAFEKIDS_FRONTEND_IMG="safekids-frontend:latest"
SAFEKIDS_BACKEND_IMG="safekids-backend:latest"
PAPERATLAS_FRONTEND_IMG="paperatlas-dz:latest"
PAPERATLAS_BFF_IMG="paperatlas-dz-bff:latest"

# ── Fonctions utilitaires ─────────────────────────────────────────────────────
info()  { echo -e "\033[1;34m[INFO]\033[0m  $*"; }
ok()    { echo -e "\033[1;32m[OK]\033[0m    $*"; }
warn()  { echo -e "\033[1;33m[WARN]\033[0m  $*"; }
err()   { echo -e "\033[1;31m[ERR]\033[0m   $*" >&2; }
step()  { echo -e "\n\033[1;36m═══ $* ═══\033[0m"; }

check_command() {
  command -v "$1" &>/dev/null || { err "Commande requise non trouvée : $1"; exit 1; }
}

# ── Phase 0 : Pré-requis ─────────────────────────────────────────────────────
phase_prerequisites() {
  step "Phase 0 — Vérification des pré-requis locaux"
  check_command docker
  check_command ssh
  check_command scp

  if [ ! -d "${SAFEKIDS_DIR}/k8s" ]; then
    err "Dossier k8s SafeKids introuvable : ${SAFEKIDS_DIR}/k8s"
    exit 1
  fi

  if [ ! -d "${PAPERATLAS_DIR}/app-source/k8s" ]; then
    err "Dossier k8s PaperAtlas-dz introuvable : ${PAPERATLAS_DIR}/app-source/k8s"
    exit 1
  fi

  info "Test de connexion SSH vers ${REMOTE_USER}@${REMOTE_HOST}..."
  ${SSH_CMD} "echo 'SSH OK'" || { err "Impossible de se connecter au serveur distant"; exit 1; }
  ok "Pré-requis validés"
}

# ── Phase 1 : Installation de k3s sur le serveur distant ─────────────────────
phase_install_k3s() {
  step "Phase 1 — Installation de k3s sur ${REMOTE_HOST}"

  # Vérifier si k3s est déjà installé
  if ${SSH_CMD} "command -v k3s &>/dev/null"; then
    ok "k3s est déjà installé"
    ${SSH_CMD} "k3s --version"
  else
    info "Installation de k3s..."
    ${SSH_CMD} "curl -sfL https://get.k3s.io | sh -s - --write-kubeconfig-mode 644"
    info "Attente du démarrage de k3s..."
    ${SSH_CMD} "sleep 10 && k3s kubectl wait --for=condition=Ready node --all --timeout=120s"
    ok "k3s installé et prêt"
  fi

  # Vérifier que le nœud est Ready
  ${SSH_CMD} "k3s kubectl get nodes"
}

# ── Phase 2 : Build des images Docker ────────────────────────────────────────
phase_build_images() {
  step "Phase 2 — Build des images Docker"

  # SafeKids Frontend
  info "Build ${SAFEKIDS_FRONTEND_IMG}..."
  docker build -t "${SAFEKIDS_FRONTEND_IMG}" -f "${SAFEKIDS_DIR}/Dockerfile" "${SAFEKIDS_DIR}"
  ok "${SAFEKIDS_FRONTEND_IMG}"

  # SafeKids Backend
  info "Build ${SAFEKIDS_BACKEND_IMG}..."
  docker build -t "${SAFEKIDS_BACKEND_IMG}" -f "${SAFEKIDS_DIR}/server/Dockerfile" "${SAFEKIDS_DIR}/server"
  ok "${SAFEKIDS_BACKEND_IMG}"

  # PaperAtlas-dz Frontend (utilise l'app pré-buildée si disponible)
  if [ -d "${PAPERATLAS_DIR}/app-build" ]; then
    info "Build ${PAPERATLAS_FRONTEND_IMG} (Dockerfile.nginx — pré-buildé)..."
    docker build -t "${PAPERATLAS_FRONTEND_IMG}" -f "${PAPERATLAS_DIR}/Dockerfile.nginx" "${PAPERATLAS_DIR}"
  else
    info "Build ${PAPERATLAS_FRONTEND_IMG} (Dockerfile.nginx-spa — multi-stage)..."
    docker build -t "${PAPERATLAS_FRONTEND_IMG}" -f "${PAPERATLAS_DIR}/app-source/Dockerfile.nginx-spa" "${PAPERATLAS_DIR}/app-source"
  fi
  ok "${PAPERATLAS_FRONTEND_IMG}"

  # PaperAtlas-dz BFF
  info "Build ${PAPERATLAS_BFF_IMG}..."
  docker build -t "${PAPERATLAS_BFF_IMG}" -f "${PAPERATLAS_DIR}/app-source/bff/Dockerfile" "${PAPERATLAS_DIR}/app-source/bff"
  ok "${PAPERATLAS_BFF_IMG}"
}

# ── Phase 3 : Transfert des images vers le serveur ──────────────────────────
phase_transfer_images() {
  step "Phase 3 — Transfert des images vers ${REMOTE_HOST}"

  local images=(
    "${SAFEKIDS_FRONTEND_IMG}"
    "${SAFEKIDS_BACKEND_IMG}"
    "${PAPERATLAS_FRONTEND_IMG}"
    "${PAPERATLAS_BFF_IMG}"
  )

  for img in "${images[@]}"; do
    info "Transfert de ${img}..."
    docker save "${img}" | ${SSH_CMD} "k3s ctr images import -"
    ok "${img} transféré"
  done

  info "Vérification des images sur le serveur..."
  ${SSH_CMD} "k3s ctr images list | grep -E 'safekids|paperatlas'"
}

# ── Phase 4 : Déploiement des manifestes K8s ──────────────────────────────────
phase_deploy_manifests() {
  step "Phase 4 — Déploiement des manifestes Kubernetes"

  local tmp_dir="/tmp/k8s-deploy-$$"
  ${SSH_CMD} "mkdir -p ${tmp_dir}/safekids ${tmp_dir}/paperatlas"

  # ─── SafeKids ───
  info "Upload des manifestes SafeKids..."
  ${SCP_CMD} -r "${SAFEKIDS_DIR}/k8s/"* "${REMOTE_USER}@${REMOTE_HOST}:${tmp_dir}/safekids/"

  info "Application des manifestes SafeKids..."
  ${SSH_CMD} "k3s kubectl apply -f ${tmp_dir}/safekids/namespace.yml"
  ${SSH_CMD} "k3s kubectl apply -f ${tmp_dir}/safekids/secrets.yml"
  ${SSH_CMD} "k3s kubectl apply -f ${tmp_dir}/safekids/configmap.yml"
  ${SSH_CMD} "k3s kubectl apply -f ${tmp_dir}/safekids/postgres.yml"
  ${SSH_CMD} "k3s kubectl apply -f ${tmp_dir}/safekids/backend.yml"
  ${SSH_CMD} "k3s kubectl apply -f ${tmp_dir}/safekids/frontend.yml"
  ${SSH_CMD} "k3s kubectl apply -f ${tmp_dir}/safekids/ingress.yml"
  ok "SafeKids déployé dans le namespace 'safekids'"

  # ─── PaperAtlas-dz ───
  info "Upload des manifestes PaperAtlas-dz..."
  ${SCP_CMD} -r "${PAPERATLAS_DIR}/app-source/k8s/"* "${REMOTE_USER}@${REMOTE_HOST}:${tmp_dir}/paperatlas/"

  info "Application des manifestes PaperAtlas-dz..."
  # Namespace
  ${SSH_CMD} "k3s kubectl apply -f ${tmp_dir}/paperatlas/00-namespace/ns-paperatlas-dz.yml"
  # PostgreSQL + PostgREST
  ${SSH_CMD} "k3s kubectl apply -f ${tmp_dir}/paperatlas/01-postgres/"
  # ConfigMaps (Nginx, Supabase)
  ${SSH_CMD} "k3s kubectl apply -f ${tmp_dir}/paperatlas/02-postgrest/"
  # Frontend
  ${SSH_CMD} "k3s kubectl apply -f ${tmp_dir}/paperatlas/03-frontend/"
  # Auth
  ${SSH_CMD} "k3s kubectl apply -f ${tmp_dir}/paperatlas/04-auth/"
  # Monitoring (LimitRange)
  ${SSH_CMD} "k3s kubectl apply -f ${tmp_dir}/paperatlas/05-monitoring/"
  # Ingress
  ${SSH_CMD} "k3s kubectl apply -f ${tmp_dir}/paperatlas/06-ingress/"
  # BFF (via base)
  ${SSH_CMD} "k3s kubectl apply -f ${tmp_dir}/paperatlas/base/bff-deployment.yaml"
  # Jobs
  ${SSH_CMD} "k3s kubectl apply -f ${tmp_dir}/paperatlas/jobInitSUP-printatlas-dz.yml || true"
  ${SSH_CMD} "k3s kubectl apply -f ${tmp_dir}/paperatlas/ressourceQuotas-printatlas-dz.yml || true"
  ok "PaperAtlas-dz déployé dans le namespace 'paperatlas-dz'"

  # Nettoyage
  ${SSH_CMD} "rm -rf ${tmp_dir}"
}

# ── Phase 5 : Vérification du déploiement ────────────────────────────────────
phase_verify() {
  step "Phase 5 — Vérification du déploiement"

  info "Pods SafeKids :"
  ${SSH_CMD} "k3s kubectl get pods -n safekids -o wide"

  info "Services SafeKids :"
  ${SSH_CMD} "k3s kubectl get svc -n safekids"

  info "Ingress SafeKids :"
  ${SSH_CMD} "k3s kubectl get ingress -n safekids"

  echo ""

  info "Pods PaperAtlas-dz :"
  ${SSH_CMD} "k3s kubectl get pods -n paperatlas-dz -o wide"

  info "Services PaperAtlas-dz :"
  ${SSH_CMD} "k3s kubectl get svc -n paperatlas-dz"

  info "Ingress PaperAtlas-dz :"
  ${SSH_CMD} "k3s kubectl get ingress -n paperatlas-dz"

  echo ""
  ok "Déploiement terminé !"
  echo ""
  info "URLs d'accès :"
  echo "  SafeKids    → http://safekids.87.106.4.161.nip.io"
  echo "  PaperAtlas  → http://paperatlas.87.106.4.161.nip.io"
  echo ""
  info "Commandes utiles :"
  echo "  ssh ${REMOTE_USER}@${REMOTE_HOST} 'k3s kubectl get pods -A'"
  echo "  ssh ${REMOTE_USER}@${REMOTE_HOST} 'k3s kubectl logs -n safekids deploy/safekids-backend'"
  echo "  ssh ${REMOTE_USER}@${REMOTE_HOST} 'k3s kubectl logs -n paperatlas-dz deploy/web-deployment'"
}

# ── Phase 6 : Attente que les pods soient Ready ─────────────────────────────
phase_wait_ready() {
  step "Phase 6 — Attente du démarrage des pods"

  info "Attente des pods SafeKids..."
  ${SSH_CMD} "k3s kubectl wait --for=condition=Ready pod -l app.kubernetes.io/part-of=safekids -n safekids --timeout=180s" || warn "Certains pods SafeKids ne sont pas encore prêts"

  info "Attente des pods PaperAtlas-dz..."
  ${SSH_CMD} "k3s kubectl wait --for=condition=Ready pod -l app=web -n paperatlas-dz --timeout=180s" || warn "Certains pods PaperAtlas ne sont pas encore prêts"

  ok "Pods en état Ready"
}

# ── Main ──────────────────────────────────────────────────────────────────────
main() {
  echo ""
  echo "╔═══════════════════════════════════════════════════════════╗"
  echo "║  Déploiement K8s — SafeKids + PaperAtlas-dz               ║"
  echo "║  Cible : ${REMOTE_HOST} (k3s)                       ║"
  echo "╚═══════════════════════════════════════════════════════════╝"
  echo ""

  local phase="${1:-all}"

  case "${phase}" in
    prereqs)   phase_prerequisites ;;
    k3s)       phase_install_k3s ;;
    build)     phase_build_images ;;
    transfer)  phase_transfer_images ;;
    deploy)    phase_deploy_manifests ;;
    verify)    phase_verify ;;
    wait)      phase_wait_ready ;;
    all)
      phase_prerequisites
      phase_install_k3s
      phase_build_images
      phase_transfer_images
      phase_deploy_manifests
      phase_wait_ready
      phase_verify
      ;;
    *)
      echo "Usage: $0 [prereqs|k3s|build|transfer|deploy|wait|verify|all]"
      echo "  prereqs  — Vérifie les outils locaux + SSH"
      echo "  k3s      — Installe k3s sur le serveur distant"
      echo "  build    — Build les images Docker localement"
      echo "  transfer — Transfère les images vers le serveur"
      echo "  deploy   — Applique les manifestes K8s"
      echo "  wait     — Attend que les pods soient Ready"
      echo "  verify   — Affiche l'état du déploiement"
      echo "  all      — Exécute toutes les phases (défaut)"
      exit 1
      ;;
  esac
}

main "$@"
