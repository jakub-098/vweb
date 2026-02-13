"use client";

import Image from "next/image";

export default function HappyCustomers() {
  return (
    
      <div className="flex flex-wrap items-center justify-center gap-10 mb-12 sm:mb-16">
        <a href="https://www.easy-project.sk" target="_blank" rel="noopener noreferrer" className="block">
          <Image src="/logos/easyproject.png" alt="Easy Project" width={180} height={72} className="h-20 w-auto object-contain mx-auto grayscale hover:grayscale-0 transition" />
        </a>
        <a href="https://www.chaletrobinson.sk" target="_blank" rel="noopener noreferrer" className="block">
          <Image src="/logos/chalet_robinson.png" alt="Chalet Robinson" width={150} height={84} className="h-[5.5rem] w-auto object-contain mx-auto grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition" />
        </a>
        <a href="https://www.zct3.eu" target="_blank" rel="noopener noreferrer" className="block">
          <Image src="/logos/zct3.png" alt="ZCT3" width={160} height={64} className="h-16 w-auto object-contain mx-auto grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition" />
        </a>
        <a href="https://www.vweb.sk" target="_blank" rel="noopener noreferrer" className="block">
          <Image src="/logos/vweb.png" alt="Vas Web" width={180} height={72} className="h-[2.5rem] w-auto object-contain mx-auto grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition" />
        </a>
        <a href="https://www.adamvirlic.com" target="_blank" rel="noopener noreferrer" className="block">
          <Image src="/logos/adamvirlic.png" alt="Adam Virlic" width={180} height={72} className="h-20 w-auto object-contain mx-auto grayscale hover:grayscale-0 transition" />
        </a>
        
        
        {/* <a href="https://www.depos.sk" target="_blank" rel="noopener noreferrer" className="block">
          <Image src="/logos/depos.png" alt="Depos" width={150} height={100} className="h-[2.25rem] w-auto object-contain mx-auto grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition" />
        </a> */}
        
      </div>
    
  );
}
