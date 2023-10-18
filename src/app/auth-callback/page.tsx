import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { trpc } from "../_trpc/client";

const AuthCallbackPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const origin = searchParams.get("origin");

  const { data, isLoading } = trpc.authCallback.useQuery(undefined, {
    onSuccess: ({ success }) => {
      if (!success) return;
      router.push(origin ? `/${origin}` : "/dashboard");
    },
  });

  return <div>AuthCallbackPage</div>;
};

export default AuthCallbackPage;
