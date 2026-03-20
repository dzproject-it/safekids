#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# deploy-remote-build.sh — Build + Déploiement SafeKids sur 87.106.4.161
#   Variante : build des images DIRECTEMENT sur le serveur distant
#   (quand Docker Desktop local n'est pas disponible)
# ═══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────────────
REMOTE_HOST="87.106.4.161"
REMOTE_USER="${REMOTE_USER:-root}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_paperatlas}"
SSH_OPTS="-o StrictHostKeyChecking=accept-new -o ConnectTimeout=10 -i ${SSH_KEY}"
SSH_CMD="ssh ${SSH_OPTS} ${REMOTE_USER}@${REMOTE_HOST}"
SCP_CMD="scp ${SSH_OPTS}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SAFEKIDS_DIR="${SCRIPT_DIR}"
REMOTE_BUILD_DIR="/tmp/safekids-build"

SAFEKIDS_FRONTEND_IMG="safekids-frontend:latest"
SAFEKIDS_BACKEND_IMG="safekids-backend:latest"

# ── Fonctions utilitaires ─────────────────────────────────────────────────────
info()  { echo -e "\033[1;34m[INFO]\033[0m  $*"; }
ok()    { echo -e "\033[1;32m[OK]\033[0m    $*"; }
warn()  { echo -e "\033[1;33m[WARN]\033[0m  $*"; }
err()   { echo -e "\033[1;31m[ERR]\033[0m   $*" >&2; }
step()  { echo -e "\n\033[1;36m═══ $* ═══\033[0m"; }

# ── Charger les secrets depuis .env ───────────────────────────────────────────
ENV_FILE="${SAFEKIDS_DIR}/.env"
if [ -f "${ENV_FILE}" ]; then
  # Nettoyer les \r (CRLF Windows) avant de sourcer
  CLEAN_ENV=$(sed 's/\r$//' "${ENV_FILE}")
  set -a
  eval "${CLEAN_ENV}"
  set +a
  info "Secrets chargés depuis .env"
else
  warn "Fichier .env introuvable — les clés Stripe ne seront pas configurées"
fi

VITE_STRIPE_PUBLIC_KEY="${VITE_STRIPE_PUBLIC_KEY:-}"
STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY:-}"
STRIPE_WEBHOOK_SECRET="${STRIPE_WEBHOOK_SECRET:-}"
ADMIN_TOKEN="${ADMIN_TOKEN:-}"

if [ -z "${VITE_STRIPE_PUBLIC_KEY}" ] || [ "${VITE_STRIPE_PUBLIC_KEY}" = "pk_test_PLACEHOLDER" ]; then
  warn "VITE_STRIPE_PUBLIC_KEY non configurée — Stripe sera désactivé côté frontend"
fi
if [ -z "${STRIPE_SECRET_KEY}" ] || [ "${STRIPE_SECRET_KEY}" = "sk_test_PLACEHOLDER" ]; then
  warn "STRIPE_SECRET_KEY non configurée — les paiements seront désactivés côté backend"
fi

# ── Phase 0 : Pre-requis ─────────────────────────────────────────────────────
step "Phase 0 — Vérification"

info "Test de connexion SSH..."
${SSH_CMD} "echo 'SSH OK'" || { err "Impossible de se connecter"; exit 1; }
ok "Connexion SSH"

# ── Phase 1 : Transfert des sources ──────────────────────────────────────────
step "Phase 1 — Transfert des sources vers ${REMOTE_HOST}"

${SSH_CMD} "rm -rf ${REMOTE_BUILD_DIR} && mkdir -p ${REMOTE_BUILD_DIR}/server"

# Créer un tar local en excluant node_modules et .git
info "Compression des sources SafeKids..."
cd "${SAFEKIDS_DIR}"
tar czf /tmp/safekids-src.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  --exclude='out' \
  .

info "Upload des sources..."
${SCP_CMD} /tmp/safekids-src.tar.gz "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_BUILD_DIR}/"
rm -f /tmp/safekids-src.tar.gz

info "Extraction sur le serveur..."
${SSH_CMD} "cd ${REMOTE_BUILD_DIR} && tar xzf safekids-src.tar.gz && rm safekids-src.tar.gz"
ok "Sources transférées"

# ── Phase 2 : Build des images sur le serveur distant ─────────────────────────
step "Phase 2 — Build des images Docker sur ${REMOTE_HOST}"

info "Build ${SAFEKIDS_FRONTEND_IMG}..."
${SSH_CMD} "cd ${REMOTE_BUILD_DIR} && docker build --build-arg VITE_STRIPE_PUBLIC_KEY='${VITE_STRIPE_PUBLIC_KEY}' -t ${SAFEKIDS_FRONTEND_IMG} -f Dockerfile ."
ok "${SAFEKIDS_FRONTEND_IMG}"

info "Build ${SAFEKIDS_BACKEND_IMG}..."
${SSH_CMD} "cd ${REMOTE_BUILD_DIR}/server && docker build -t ${SAFEKIDS_BACKEND_IMG} -f Dockerfile ."
ok "${SAFEKIDS_BACKEND_IMG}"

# ── Phase 3 : Vérification des images Docker ──────────────────────────────────
step "Phase 3 — Vérification des images Docker"

# k3s utilise Docker (cri-dockerd), les images docker build sont directement disponibles
${SSH_CMD} "docker images | grep safekids"
ok "Images disponibles pour k3s (via Docker)"

# ── Phase 4 : Déploiement des manifestes K8s ──────────────────────────────────
step "Phase 4 — Déploiement des manifestes Kubernetes"

info "Upload des manifestes K8s..."
${SCP_CMD} -r "${SAFEKIDS_DIR}/k8s/"* "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_BUILD_DIR}/k8s-manifests/" 2>/dev/null || {
  ${SSH_CMD} "mkdir -p ${REMOTE_BUILD_DIR}/k8s-manifests"
  ${SCP_CMD} -r "${SAFEKIDS_DIR}/k8s/"* "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_BUILD_DIR}/k8s-manifests/"
}

K8S_DIR="${REMOTE_BUILD_DIR}/k8s-manifests"

# Injecter les secrets Stripe dans le manifeste secrets.yml
info "Injection des secrets Stripe dans les manifestes..."
${SSH_CMD} "sed -i 's|\${STRIPE_SECRET_KEY}|${STRIPE_SECRET_KEY}|g' ${K8S_DIR}/secrets.yml"
${SSH_CMD} "sed -i 's|\${STRIPE_WEBHOOK_SECRET}|${STRIPE_WEBHOOK_SECRET}|g' ${K8S_DIR}/secrets.yml"
${SSH_CMD} "sed -i 's|\${ADMIN_TOKEN}|${ADMIN_TOKEN}|g' ${K8S_DIR}/secrets.yml"

info "Application des manifestes SafeKids..."
${SSH_CMD} "k3s kubectl apply -f ${K8S_DIR}/namespace.yml"
${SSH_CMD} "k3s kubectl apply -f ${K8S_DIR}/secrets.yml"
${SSH_CMD} "k3s kubectl apply -f ${K8S_DIR}/configmap.yml"
${SSH_CMD} "k3s kubectl apply -f ${K8S_DIR}/postgres.yml"
${SSH_CMD} "k3s kubectl apply -f ${K8S_DIR}/backend.yml"
${SSH_CMD} "k3s kubectl apply -f ${K8S_DIR}/frontend.yml"
${SSH_CMD} "k3s kubectl apply -f ${K8S_DIR}/middleware.yml 2>/dev/null || true"
${SSH_CMD} "k3s kubectl apply -f ${K8S_DIR}/ingress.yml"
ok "Manifestes appliqués"

# ── Phase 5 : Restart des deployments pour forcer le pull des nouvelles images
step "Phase 5 — Restart des déploiements"

${SSH_CMD} "k3s kubectl rollout restart deployment -n safekids" || warn "Pas de déploiement à redémarrer"
info "Attente des pods SafeKids..."
${SSH_CMD} "k3s kubectl rollout status deployment -n safekids --timeout=180s" || warn "Timeout — certains pods ne sont pas encore prêts"

# ── Phase 6 : Vérification ────────────────────────────────────────────────────
step "Phase 6 — Vérification du déploiement"

info "Pods SafeKids :"
${SSH_CMD} "k3s kubectl get pods -n safekids -o wide"

info "Services SafeKids :"
${SSH_CMD} "k3s kubectl get svc -n safekids"

info "Ingress SafeKids :"
${SSH_CMD} "k3s kubectl get ingress -n safekids"

# Nettoyage
${SSH_CMD} "rm -rf ${REMOTE_BUILD_DIR}"

echo ""
ok "Déploiement SafeKids terminé !"
echo ""
info "URL d'accès : http://safekids.87.106.4.161.nip.io"
info "Commandes utiles :"
echo "  ssh ${REMOTE_USER}@${REMOTE_HOST} 'k3s kubectl get pods -n safekids'"
echo "  ssh ${REMOTE_USER}@${REMOTE_HOST} 'k3s kubectl logs -n safekids deploy/safekids-backend'"
