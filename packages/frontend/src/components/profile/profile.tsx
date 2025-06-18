import { useAuth } from "@/store/auth/auth.hooks";
import { Label } from "../ui/label";
import { Image, Pencil } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

const Profile = () => {
  const { user } = useAuth();

  const formatBirthDay = (birthDay: string) => {
    return birthDay.split("T")[0];
  };

  return (
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
            <Label>{user?.email}</Label>
            <Label>{user?.role}</Label>
            <Label>{user?.birthDay && formatBirthDay(user.birthDay)}</Label>
          </div>
        </div>
        <div className="flex flex-col gap-6 items-center">
          <Button variant="secondary" className="rounded-full w-fit">
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
    </section>
  );
};

export default Profile;
