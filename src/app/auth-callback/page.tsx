import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";

const AuthCallbackPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const origin = searchParams.get("origin");

  return <div>AuthCallbackPage</div>;
};

export default AuthCallbackPage;
