import { useCriiptoVerify } from "@criipto/verify-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const { complete, claims } = useCriiptoVerify();
  const navigate = useNavigate();

  useEffect(() => {
    complete();
  }, [complete]);

  useEffect(() => {
    if (claims) {
      navigate(`/clientform?personnummer=${claims.personal_identity_number}`);
    }
  }, [claims, navigate]);

  return <div>Completing authentication...</div>;
}
