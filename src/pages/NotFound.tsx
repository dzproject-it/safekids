import { useLocation } from "react-router-dom";
import * as S from '../styles/NotFound.styles';

export default function NotFound() {
  const location = useLocation();

  return (
    <div className={S.wrapper}>
      <h1 className={S.bigNumber}>404</h1>
      <div className={S.content}>
        <h1 className={S.title}>This page has not been generated</h1>
        <p className={S.path}>{location.pathname}</p>
        <p className={S.subtitle}>Tell me more about this page, so I can generate it</p>
      </div>
    </div>
  );
}