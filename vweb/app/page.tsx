import Header from "./components/header";
import HowItWorks from "./components/how-it-works";
import Eshops from "./components/eshops";
import CustomWeb from "./components/custom-web";
import Contact from "./components/contact";
import Navbar from "./components/navbar";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-[radial-gradient(circle_at_top,_#4c1d95_0,_#02010a_25%,_#02010a_55%,_transparent_70%),radial-gradient(circle_at_bottom,_#4c1d95_0,_#02010a_35%,_#000_80%)] text-zinc-50">
      <Navbar />
      <Header />
      <HowItWorks />
      <Eshops />
      <CustomWeb />
      <Contact />
    </div>
  );
}
