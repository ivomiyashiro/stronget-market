import { useAuth } from "@/store/auth/auth.hooks";
import { Label } from "../ui/label";
import {
    Calendar,
    Image,
    Mail,
    Pencil,
    Upload,
    Users,
    Star,
    Eye,
    TrendingUp,
    Briefcase,
} from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useMemo, useState, useRef, useEffect } from "react";
import { RequiredInput } from "../common/required-input";
import { useAppDispatch } from "@/store/hooks";
import { updateProfile, uploadAvatar } from "@/store/profile/profile.thunks";
import { useProfile } from "@/store/profile/profile.hooks";
import { getTrainerStatistics } from "@/store/trainer/trainer.thunks";
import { useTrainerStatistics, useTrainerLoading } from "@/store/trainer/trainer.hooks";

interface EditingForm {
    name: string;
    surname: string;
    email: string;
    birthDay: string;
}

const Profile = () => {
    const { user } = useAuth();
    const { isLoading } = useProfile();
    const dispatch = useAppDispatch();
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [editingForm, setEditingForm] = useState<EditingForm>({
        name: user?.name || "",
        surname: user?.surname || "",
        email: user?.email || "",
        birthDay: user?.birthDay || "",
    });

    // Trainer-specific state
    const trainerStatistics = useTrainerStatistics();
    const trainerLoading = useTrainerLoading();
    const isTrainer = user?.role === "entrenador";

    // Fetch trainer statistics when user is a trainer
    useEffect(() => {
        if (isTrainer && user?.id) {
            dispatch(getTrainerStatistics({ id: user.id }));
        }
    }, [isTrainer, user?.id, dispatch]);

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
        if (!user?.id) return;

        // First upload avatar if a new file was selected
        if (selectedFile) {
            await dispatch(
                uploadAvatar({ userId: user.id, file: selectedFile })
            ).unwrap();
        }

        // Then update profile data
        await dispatch(
            updateProfile({ userId: user.id, profileData: editingForm })
        ).unwrap();

        // Reset form state
        setSelectedFile(null);
        setPreviewUrl(null);
        setIsEditing(false);
    };

    const handleDelete = () => {
        console.log("delete");
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            alert("Por favor selecciona un archivo de imagen válido");
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            alert("El archivo es demasiado grande. Máximo 5MB.");
            return;
        }

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
            name: user?.name || "",
            surname: user?.surname || "",
            email: user?.email || "",
            birthDay: user?.birthDay || "",
        });
        setSelectedFile(null);
        setPreviewUrl(null);
        setIsEditing(false);
    };

    // Get the current avatar URL to display
    const currentAvatarUrl = previewUrl || user?.avatar;

    return !isEditing ? (
        <section className="flex h-full p-8 w-full flex-col gap-8">
            <div className="flex flex-row justify-between w-full">
                <div className="flex flex-row gap-4">
                    {user?.avatar ? (
                        <img
                            src={user?.avatar}
                            alt={`Foto de ${user?.name}`}
                            className="h-full w-full object-cover rounded-full h-40 w-40 max-h-40 max-w-40"
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

            {/* Trainer Statistics Cards */}
            {isTrainer && (
                <div className="w-full">
                    <h2 className="text-2xl font-bold mb-6">Estadísticas</h2>
                    {trainerLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : trainerStatistics ? (
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-row gap-4 w-full">
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

                            <div className="flex flex-row gap-4 w-full">
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
                                                Promedio de calificaciones y evaluaciones
                                                totales.
                                            </p>
                                            <p className="text-muted-foreground mt-1">
                                                {trainerStatistics.averageRating.toFixed(
                                                    1
                                                )}{" "}
                                                / 5.0
                                            </p>
                                        </div>
                                        <div className="mt-2">
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-yellow-500 h-2 rounded-full transition-all duration-300 ease-in-out"
                                                    style={{
                                                        width: `${
                                                            (trainerStatistics.averageRating /
                                                                5) *
                                                            100
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
                                                Promedio de calificaciones y evaluaciones
                                                totales.
                                            </p>
                                            <p className="text-muted-foreground mt-1">
                                                {trainerStatistics.performance.toFixed(1)}
                                                %
                                            </p>
                                        </div>
                                        <div className="mt-2">
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-green-500 h-2 rounded-full transition-all duration-300 ease-in-out"
                                                    style={{
                                                        width: `${Math.min(
                                                            trainerStatistics.performance,
                                                            100
                                                        )}%`,
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            No se pudieron cargar las estadísticas
                        </div>
                    )}
                </div>
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
                                errors.birthDay
                                    ? "La fecha de nacimiento es requerida"
                                    : ""
                            }
                        />
                    </div>
                </div>
                <div className="flex flex-row gap-4 justify-between">
                    <Button variant="destructive" onClick={handleDelete}>
                        Eliminar usuario
                    </Button>
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
