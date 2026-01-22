"use client"

import { CreateBusinessManual } from "@/components/dashboard/create-business-manual"

// Note: La création par IA est commentée pour le moment
// import { useState } from "react"
// import { CreateBusinessAI } from "@/components/dashboard/create-business-ai"
// type CreationMode = "choice" | "manual" | "ai"

export default function CreateBusinessPage() {
  // Ouvre directement le formulaire de création manuelle
  return <CreateBusinessManual />
} 