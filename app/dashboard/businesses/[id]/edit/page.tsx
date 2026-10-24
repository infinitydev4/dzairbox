import { redirect } from "next/navigation"
export default async function EditBusiness({params}:{params:Promise<{id:string}>}){redirect(`/dashboard/businesses/${(await params).id}/studio`)}
