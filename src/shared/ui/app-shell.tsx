"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, type ReactNode } from "react";
import { LearningProvider } from "@/modules/learning";
import { Icon } from "./icons";

export function AppShell({ owner, children }: { owner: { id: string; email: string } | null; children: ReactNode }) {
  const pathname = usePathname();
  const drawer = useRef<HTMLDialogElement>(null);
  const isHome = pathname === "/";
  const isLesson = pathname.includes("/questions/");
  const inPreparation = pathname === "/prepare" || pathname.startsWith("/prepare/studio");
  const links = [
    { href: "/", label: "Learning", icon: "book" as const, active: !pathname.startsWith("/prepare") },
    { href: "/prepare", label: "Preparation", icon: "message" as const, active: inPreparation },
    { href: "/prepare/profile", label: "My profile", icon: "user" as const, active: pathname.startsWith("/prepare/profile") },
  ];
  function navigation(mobile = false) {
    return <>
      <Link href="/" className="app-brand" onClick={() => drawer.current?.close()}>Interview Concept</Link>
      <nav aria-label={mobile ? "Mobile navigation" : "Main navigation"} className="app-navigation">{links.map((link) => <Link key={link.href} href={link.href} aria-current={link.active ? "page" : undefined} className={link.active ? "app-nav-link is-active" : "app-nav-link"} onClick={() => drawer.current?.close()}><Icon name={link.icon} size={23} />{link.label}</Link>)}</nav>
      {!mobile && isLesson ? <div id="course-navigation-slot" className="app-course-slot" /> : null}
      {inPreparation ? <nav aria-label="Preparation navigation" className="app-subnav"><Link href="/prepare" onClick={() => drawer.current?.close()}><Icon name="file" />Stories</Link><Link href="/prepare/studio" onClick={() => drawer.current?.close()}><Icon name="message" />Behavioral practice</Link><Link href="/prepare/studio#foundations" onClick={() => drawer.current?.close()}><Icon name="layers" />Technical foundations</Link></nav> : null}
      {!isLesson || mobile ? <div className="app-sidebar-footer"><Icon name={owner ? "lock" : "cloud"} size={25} /><div><strong>{owner ? "Your private workspace" : "Save your place"}</strong><p>{owner ? "资料与进度仅你的账号可见" : "Sign in to sync across devices"}</p></div>{owner ? <form action="/auth/signout" method="post"><button className="ui-button ui-button-secondary w-full" type="submit"><Icon name="logout" size={17} />Sign out</button></form> : <Link href="/login" className="ui-button ui-button-secondary w-full">Sign in</Link>}</div> : null}
    </>;
  }
  return <LearningProvider enabled={Boolean(owner)}>
    <a href="#main-content" className="skip-link">Skip to content</a>
    <aside className="app-sidebar">{navigation()}</aside>
    <div className="app-mobile-header"><Link className="app-brand" href="/">Interview Concept</Link><button className="ui-icon-button" aria-label="Open navigation" onClick={() => drawer.current?.showModal()}><Icon name="menu" size={24} /></button></div>
    <dialog ref={drawer} className="app-drawer"><button className="app-drawer-close ui-icon-button" aria-label="Close navigation" onClick={() => drawer.current?.close()}><Icon name="close" /></button>{navigation(true)}</dialog>
    <div className={`app-body${isHome ? " app-body-home" : ""}`}><div className={`app-account-bar${isHome ? " app-account-bar-home" : ""}`}>{owner ? <><span className="private-account-label"><Icon name="lock" size={16} />Private workspace</span><Link href="/prepare/profile" className="app-account-link"><span className="account-avatar"><Icon name="user" size={18} /></span>Account</Link></> : <Link href="/login" className="ui-button ui-button-primary">Sign in</Link>}</div>{children}</div>
  </LearningProvider>;
}
