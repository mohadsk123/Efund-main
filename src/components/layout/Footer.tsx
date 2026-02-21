"use client";

import React from "react";
import { Twitter, Github, Linkedin, Facebook } from "lucide-react"; // Import social media icons

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background text-muted-foreground py-8 px-6 mt-12">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
          <span className="font-semibold text-foreground text-lg">E-Fund System</span>
          <span>© {currentYear} All rights reserved.</span>
        </div>
        
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-primary transition-colors">Support</a>
        </div>

        <div className="flex items-center gap-4">
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors dark:neon-hover p-1 rounded-full">
            <Twitter className="h-5 w-5" />
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors dark:neon-hover p-1 rounded-full">
            <Github className="h-5 w-5" />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors dark:neon-hover p-1 rounded-full">
            <Linkedin className="h-5 w-5" />
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors dark:neon-hover p-1 rounded-full">
            <Facebook className="h-5 w-5" />
          </a>
        </div>
        
        <span className="text-xs text-muted-foreground mt-4 md:mt-0">Made by Armiet Students</span>
      </div>
    </footer>
  );
};

export default Footer;