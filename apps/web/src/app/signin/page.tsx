import { SigninPage } from "@/components/auth/signin-page";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { authIllustration } from "@/data/storefront";

export default function SigninRoute() {
  return (
    <>
      <SiteHeader />
      <SigninPage illustration={authIllustration} />
      <SiteFooter />
    </>
  );
}
