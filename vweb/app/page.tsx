import Header from "./components/header";
import HowItWorks from "./components/how-it-works";
import Eshops from "./components/eshops";
import CustomWeb from "./components/custom-web";
import Contact from "./components/contact";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-[radial-gradient(circle_at_top,_#4c1d95_0,_#02010a_45%,_#000_100%)] text-zinc-50">
      <Header />
      <HowItWorks />
      <Eshops />
      <CustomWeb />
      <Contact />
    </div>
  );
}
