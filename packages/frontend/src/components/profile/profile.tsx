import { useAuth } from "@/store/auth/auth.hooks";
import { Label } from "../ui/label";
import { Calendar, Image, Mail, Pencil } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { useMemo, useState } from "react";
import { RequiredInput } from "../common/required-input";
import { useAppDispatch } from "@/store/hooks";
import { updateProfile } from "@/store/profile/profile.thunks";
import ServicesData from "./services-data";

interface EditingForm {
  name: string;
  surname: string;
  email: string;
  birthDay: string;
  profileImage: string;
}

const Profile = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [editingForm, setEditingForm] = useState<EditingForm>({
    name: user?.name || "",
    surname: user?.surname || "",
    email: user?.email || "",
    birthDay: user?.birthDay || "",
    profileImage: user?.profileImage || "",
  });

  const formatBirthDay = (birthDay: string) => {
    return birthDay.split("T")[0];
  };

  const errors = useMemo(() => {
    return {
      name: editingForm.name === "",
      surname: editingForm.surname === "",
      email: editingForm.email === "",
      birthDay: editingForm.birthDay === "",
    };
  }, [editingForm]);

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.id) return;
    dispatch(updateProfile({ userId: user.id, profileData: editingForm }));
  };

  const handleDelete = () => {
    console.log("delete");
  };

  const trainerServices = [
    {
      title: "Servicios totales",
      number: 10,
    },
    {
      title: "Total de clientes",
      number: 10,
    },
    {
      title: "Visualizaciones",
      number: 10,
    },
  ];

  const clientServices = [
    {
      title: "Servicios contratados",
      number: 10,
    },
    {
      title: "Servicios cancelados",
      number: 10,
    },
    {
      title: "Servicios finalizados",
      number: 10,
    },
  ];

  return !isEditing ? (
    <section className="flex h-full p-8 w-full flex-col gap-8">
      <div className="flex flex-row justify-between w-full">
        <div className="flex flex-row gap-4">
          {user?.profileImage ? (
            <img
              src={user?.profileImage}
              alt={`Foto de ${user?.name}`}
              className="h-full w-full object-cover rounded-full h-32 w-32"
            />
          ) : (
            <div
              className="flex items-center justify-center bg-muted rounded-full h-32 w-32"
              role="presentation"
            >
              <Image
                className="size-12 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-center">
              {user?.name} {user?.surname}
            </h1>
            <Label className="flex flex-row gap-2 items-center text-muted-foreground">
              <Mail className="size-4" /> {user?.email}
            </Label>
            <Label className="flex flex-row gap-2 items-center text-muted-foreground">
              <Calendar className="size-4" />{" "}
              {user?.birthDay && formatBirthDay(user.birthDay)}
            </Label>
          </div>
        </div>
        <div className="flex flex-col gap-6 items-center">
          <Button
            variant="secondary"
            className="rounded-full w-fit"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="size-4" />
          </Button>
          <div className="flex flex-col items-center">
            <Label className="text-sm text-muted-foreground">
              Miembro desde
            </Label>
            <Label className="text-xl">
              {user?.birthDay && formatBirthDay(user.birthDay)}
            </Label>
          </div>
        </div>
      </div>
      <Separator />
      <div className="grid grid-cols-3 gap-8">
        {user?.role === "entrenador" ? (
          trainerServices.map((service) => (
            <ServicesData key={service.title} {...service} />
          ))
        ) : (
          <div className="grid grid-cols-3 gap-8">
            {clientServices.map((service) => (
              <ServicesData key={service.title} {...service} />
            ))}
          </div>
        )}
      </div>
    </section>
  ) : (
    <section className="flex h-full p-8 w-full flex-col">
      <form className="w-full flex flex-col gap-8" onSubmit={handleUpdate}>
        <div className="flex flex-row gap-8 w-full">
          {editingForm.profileImage ? (
            <img
              src={editingForm.profileImage}
              alt={`Foto de ${editingForm.name}`}
              className="h-full w-full object-cover rounded-full h-40 w-40 flex-shrink-0"
            />
          ) : (
            <div className="flex items-center justify-center bg-muted rounded-full h-40 w-40 flex-shrink-0">
              <Image className="size-12 text-muted-foreground" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 flex-1">
            <RequiredInput
              label="Nombre"
              value={editingForm.name}
              onChange={(e) =>
                setEditingForm({ ...editingForm, name: e.target.value })
              }
              required
              fullSize
              error={errors.name ? "El nombre es requerido" : ""}
            />
            <RequiredInput
              label="Apellido"
              value={editingForm.surname}
              onChange={(e) =>
                setEditingForm({ ...editingForm, surname: e.target.value })
              }
              required
              fullSize
              error={errors.surname ? "El apellido es requerido" : ""}
            />
            <RequiredInput
              label="Email"
              value={editingForm.email}
              onChange={(e) =>
                setEditingForm({ ...editingForm, email: e.target.value })
              }
              required
              fullSize
              error={errors.email ? "El email es requerido" : ""}
            />
            <RequiredInput
              label="Fecha de nacimiento"
              value={editingForm.birthDay.split("T")[0]}
              onChange={(e) =>
                setEditingForm({ ...editingForm, birthDay: e.target.value })
              }
              required
              fullSize
              error={
                errors.birthDay ? "La fecha de nacimiento es requerida" : ""
              }
            />
          </div>
        </div>
        <div className="flex flex-row gap-4 justify-between">
          <Button variant="destructive" onClick={handleDelete}>
            Eliminar usuario
          </Button>
          <div className="flex flex-row gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditing(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={Object.values(errors).some(Boolean)}
            >
              Actualizar
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
};

export default Profile;
