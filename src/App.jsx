
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BookOpen, Upload, FileText, Languages, Volume2, Home, Sparkles, BrainCircuit } from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarFooter,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
    {
        title: "Dashboard",
        url: createPageUrl("Dashboard"),
        icon: Home,
    },
    {
        title: "Upload & Process",
        url: createPageUrl("Upload"),
        icon: Upload,
    },
    {
        title: "My Documents",
        url: createPageUrl("Documents"),
        icon: FileText,
    },
];

export default function Layout({ children, currentPageName }) {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <SidebarProvider>
                <div className="flex w-full">
                    <Sidebar className="border-r border-slate-200/60 bg-white/90 backdrop-blur-sm">
                        <SidebarHeader className="border-b border-slate-200/60 p-6">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                                        <BookOpen className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                                        <Sparkles className="w-2.5 h-2.5 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                                        EduBridge
                                    </h2>
                                    <p className="text-xs text-slate-500 font-medium">AI Learning Assistant</p>
                                </div>
                            </div>
                        </SidebarHeader>

                        <SidebarContent className="p-3">
                            <SidebarGroup>
                                <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 py-3">
                                    Navigation
                                </SidebarGroupLabel>
                                <SidebarGroupContent>
                                    <SidebarMenu className="space-y-1">
                                        {navigationItems.map((item) => (
                                            <SidebarMenuItem key={item.title}>
                                                <SidebarMenuButton
                                                    asChild
                                                    className={`rounded-xl p-3 transition-all duration-200 group ${location.pathname === item.url
                                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                                                            : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900'
                                                        }`}
                                                >
                                                    <Link to={item.url} className="flex items-center gap-3">
                                                        <item.icon className="w-5 h-5" />
                                                        <span className="font-medium">{item.title}</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>

                            <SidebarGroup className="mt-8">
                                <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 py-3">
                                    Features
                                </SidebarGroupLabel>
                                <SidebarGroupContent>
                                    <div className="px-3 py-2 space-y-3">
                                        <div className="flex items-center gap-3 text-sm text-slate-600">
                                            <Languages className="w-4 h-4 text-blue-500" />
                                            <span>Multi-language Support</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-600">
                                            <Volume2 className="w-4 h-4 text-indigo-500" />
                                            <span>Text-to-Speech</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-600">
                                            <Sparkles className="w-4 h-4 text-amber-500" />
                                            <span>AI Summarization</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-600">
                                            <BrainCircuit className="w-4 h-4 text-pink-500" />
                                            <span>AI Study Buddy</span>
                                        </div>
                                    </div>
                                </SidebarGroupContent>
                            </SidebarGroup>
                        </SidebarContent>

                        <SidebarFooter className="border-t border-slate-200/60 p-4 bg-gradient-to-r from-slate-50 to-blue-50/50">
                            <div className="text-center">
                                <p className="text-xs font-medium text-slate-600">Empowering Education</p>
                                <p className="text-xs text-slate-500">Break language barriers</p>
                            </div>
                        </SidebarFooter>
                    </Sidebar>

                    <main className="flex-1 flex flex-col min-h-screen">
                        {/* Mobile Header */}
                        <header className="bg-white/90 backdrop-blur-sm border-b border-slate-200/60 px-6 py-4 md:hidden">
                            <div className="flex items-center gap-4">
                                <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-6 h-6 text-blue-600" />
                                    <h1 className="text-lg font-bold text-slate-800">EduBridge</h1>
                                </div>
                            </div>
                        </header>

                        {/* Main Content */}
                        <div className="flex-1">
                            {children}
                        </div>
                    </main>
                </div>
            </SidebarProvider>
        </div>
    );
}
