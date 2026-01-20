import { AuthGuard } from "@/components/auth-guard";
import { FormBuilder } from "@/components/form-builder";

export default function CreateFormPage() {
  return (
    <AuthGuard>
      <FormBuilder />
    </AuthGuard>
  );
}
