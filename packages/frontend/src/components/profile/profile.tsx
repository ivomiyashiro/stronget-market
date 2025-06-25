import { useAuth } from "@/store/auth/auth.hooks";
import { useAppDispatch } from "@/store/hooks";
import { useProfile } from "@/store/profile/profile.hooks";
import { updateProfile, uploadAvatar } from "@/store/profile/profile.thunks";
import {
  useTrainerLoading,
  useTrainerStatistics,
} from "@/store/trainer/trainer.hooks";
import { getTrainerStatistics } from "@/store/trainer/trainer.thunks";
import {
  Briefcase,
  Calendar,
  Eye,
  Image,
  Mail,
  Pencil,
  Star,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useParams } from "react-router-dom";
import { RequiredInput } from "../common/required-input";
import TrainerEvaluations from "../trainer-evaluations/trainer-evaluations";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";

interface EditingForm {
  name: string;
  surname: string;
  email: string;
  birthDay: string;
}

const Profile = () => {
  const { user: loggedInUser } = useAuth();
  const {
    profile: profileUser,
    isLoading,
    error,
    fetchUserProfile,
  } = useProfile();
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState<EditingForm>({
    name: "",
    surname: "",
    email: "",
    birthDay: "",
  });

  const userId = useParams().id;

  const isMobile = useMediaQuery({ query: "(max-width: 600px)" });

  // Trainer-specific state
  const trainerStatistics = useTrainerStatistics();
  const trainerLoading = useTrainerLoading();
  const isTrainer = profileUser?.role === "entrenador";

  // 1. Agregar estado para promedio y cantidad de evaluaciones
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [totalReviews, setTotalReviews] = useState<number | null>(null);

  // Fetch profile user when component mounts or userId changes
  useEffect(() => {
    if (userId) {
      fetchUserProfile(userId);
    }
  }, [userId, fetchUserProfile]);

  // Update editing form when profile user data is loaded
  useEffect(() => {
    if (profileUser) {
      setEditingForm({
        name: profileUser.name || "",
        surname: profileUser.surname || "",
        email: profileUser.email || "",
        birthDay: profileUser.birthDay || "",
      });
    }
  }, [profileUser]);

  // Fetch trainer statistics when profile user is a trainer
  useEffect(() => {
    if (isTrainer && userId && userId === loggedInUser?.id) {
      dispatch(getTrainerStatistics({ id: userId }));
    }
  }, [isTrainer, userId, dispatch, loggedInUser?.id]);

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

  const handleUpdate = async () => {
    if (!profileUser?.id) return;

    // First upload avatar if a new file was selected
    if (selectedFile) {
      await dispatch(
        uploadAvatar({ userId: profileUser.id, file: selectedFile })
      ).unwrap();
    }

    // Then update profile data
    await dispatch(
      updateProfile({ userId: profileUser.id, profileData: editingForm })
    ).unwrap();

    // Reset form state
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsEditing(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCancel = () => {
    // Reset all form state
    setEditingForm({
      name: profileUser?.name || "",
      surname: profileUser?.surname || "",
      email: profileUser?.email || "",
      birthDay: profileUser?.birthDay || "",
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsEditing(false);
  };

  // Get the current avatar URL to display
  const currentAvatarUrl = previewUrl || profileUser?.avatar;

  // Show loading state while fetching profile
  if (isLoading) {
    return (
      <section className="flex h-full p-8 w-full flex-col gap-8">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </section>
    );
  }

  // Show error state if profile not found or other error
  if (error || !profileUser) {
    return (
      <section className="flex h-full p-8 w-full flex-col gap-8">
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="flex items-center justify-center bg-muted rounded-full h-24 w-24">
            <Users className="size-12 text-muted-foreground" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Usuario no encontrado</h2>
            <p className="text-muted-foreground">
              El perfil que estás buscando no existe o ha sido eliminado.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="mt-4"
          >
            Volver
          </Button>
        </div>
      </section>
    );
  }

  return !isEditing ? (
    <section className="flex h-full p-8 w-full flex-col gap-8">
      <div className="flex flex-row justify-between w-full">
        <div className="flex flex-row gap-4">
          {profileUser?.avatar ? (
            <img
              src={profileUser?.avatar}
              alt={`Foto de ${profileUser?.name}`}
              className="object-cover rounded-full h-40 w-40 max-h-40 max-w-40"
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
              {profileUser?.name} {profileUser?.surname}
            </h1>
            {isTrainer && averageRating !== null && totalReviews !== null && (
              <div className="flex items-center gap-2 mt-1">
                <Star className="size-4 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold text-lg">
                  {averageRating?.toFixed(1) || 0}
                </span>
                <span className="mx-1">·</span>
                <span className="text-base text-muted-foreground">
                  {totalReviews} evaluaciones
                </span>
              </div>
            )}
            <div className="flex flex-row gap-2 items-center text-muted-foreground">
              <Mail className="size-4" /> {profileUser?.email}
            </div>
            <div className="flex flex-row gap-2 items-center text-muted-foreground">
              <Calendar className="size-4" />{" "}
              {profileUser?.birthDay && formatBirthDay(profileUser.birthDay)}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-6 items-center">
          {/* Only show edit button if the logged-in user is viewing their own profile */}
          {loggedInUser?.id === userId && (
            <Button
              variant="secondary"
              className="rounded-full w-fit"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="size-4" />
            </Button>
          )}
          <div className="flex flex-col items-center">
            <div className="text-sm text-muted-foreground">Miembro desde</div>
            <div className="text-xl">
              {profileUser?.birthDay && formatBirthDay(profileUser.birthDay)}
            </div>
          </div>
        </div>
      </div>
      <Separator />

      {/* Trainer Statistics Cards */}
      {isTrainer && userId === loggedInUser?.id && (
        <div className="w-full">
          <h2 className="text-2xl font-bold mb-6">Estadísticas</h2>
          {trainerLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            trainerStatistics && (
              <div className="flex flex-col gap-4">
                <div
                  className={`flex ${
                    isMobile ? "flex-col" : "flex-row"
                  } gap-4 w-full`}
                >
                  <Card className="w-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Servicios
                      </CardTitle>
                      <Briefcase className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {trainerStatistics.totalServices}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="w-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Clientes
                      </CardTitle>
                      <Users className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {trainerStatistics.totalClients}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="w-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Visitas
                      </CardTitle>
                      <Eye className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {trainerStatistics.visits}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div
                  className={`flex ${
                    isMobile ? "flex-col" : "flex-row"
                  } gap-4 w-full`}
                >
                  <Card className="w-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Evaluaciones
                      </CardTitle>
                      <Star className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-row items-center justify-between gap-2">
                        <p className="text-sm text-muted-foreground">
                          Promedio de calificaciones y evaluaciones totales.
                        </p>
                        <p className="text-muted-foreground mt-1">
                          {trainerStatistics.averageRating?.toFixed(1) || 0} /
                          5.0
                        </p>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full transition-all duration-300 ease-in-out"
                            style={{
                              width: `${
                                (trainerStatistics.averageRating / 5) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="w-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Rendimiento de servicios
                      </CardTitle>
                      <TrendingUp className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-row items-center justify-between gap-2">
                        <p className="text-sm text-muted-foreground">
                          Promedio de calificaciones y evaluaciones totales.
                        </p>
                        <p className="text-muted-foreground mt-1">
                          {trainerStatistics.performance?.toFixed(1) || 0}%
                        </p>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-300 ease-in-out"
                            style={{
                              width: `${
                                (trainerStatistics.performance || 0)
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )
          )}
        </div>
      )}
      {isTrainer && profileUser.id && (
        <TrainerEvaluations
          trainerId={profileUser.id}
          trainerName={profileUser.name}
          onStatsUpdate={(avg, total) => {
            setAverageRating(avg);
            setTotalReviews(total);
          }}
        />
      )}
    </section>
  ) : (
    <section className="flex h-full p-8 w-full flex-col">
      <form className="w-full flex flex-col gap-8">
        <div className="flex flex-row gap-8 w-full">
          <div
            className="relative group cursor-pointer"
            onClick={handleAvatarClick}
          >
            {currentAvatarUrl ? (
              <img
                src={currentAvatarUrl}
                alt={`Foto de ${editingForm.name}`}
                className="h-full w-full object-cover rounded-full flex-shrink-0 transition-opacity group-hover:opacity-80 max-h-40 max-w-40"
              />
            ) : (
              <div className="flex items-center justify-center bg-muted rounded-full h-40 w-40 flex-shrink-0 transition-opacity group-hover:opacity-80">
                <Image className="size-12 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Upload className="size-10 text-white bg-black/50 rounded-full p-2" />
            </div>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
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
                setEditingForm({
                  ...editingForm,
                  surname: e.target.value,
                })
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
                setEditingForm({
                  ...editingForm,
                  birthDay: e.target.value,
                })
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
          <Button variant="destructive">Eliminar usuario</Button>
          <div className="flex flex-row gap-4">
            <Button type="button" variant="secondary" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={Object.values(errors).some(Boolean) || isLoading}
              onClick={handleUpdate}
            >
              {isLoading ? "Actualizando..." : "Actualizar"}
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
};

export default Profile;
