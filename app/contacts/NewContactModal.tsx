"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createContactFromContactsPage } from "./actions";
import { ContactForm } from "./ContactForm";

export function NewContactModal() {
  const [open, setOpen] = React.useState(false);

  const handleSubmit = async (fd: FormData) => {
    await createContactFromContactsPage(fd);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-premium text-white px-4 py-2 rounded-lg transition text-sm">
          Contactmoment toevoegen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-bg-card border-accent-primary text-text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
        <DialogHeader>
          <DialogTitle className="text-text-primary">Nieuw contactmoment</DialogTitle>
        </DialogHeader>
        <ContactForm onSubmit={handleSubmit} submitLabel="Opslaan" />
      </DialogContent>
    </Dialog>
  );
}