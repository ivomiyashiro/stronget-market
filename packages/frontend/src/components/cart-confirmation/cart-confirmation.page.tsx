import { User, ArrowLeft, CreditCard } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { useCartService } from "@/store/cart/cart.hooks";
import { useDispatch } from "react-redux";
import { removeServiceFromCart } from "@/store/cart/cart.slice";
import { Link, useNavigate } from "react-router-dom";
import type { AppDispatch } from "@/store/store";
import { hiringService, type CreateHiringRequest } from "@/services/hiring.service";
import { toast } from "sonner";

const CartConfirmationPage = () => {
    const cartService = useCartService();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentData, setPaymentData] = useState({
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        postalCode: "",
        country: "",
        cardholderName: "",
    });

    const handleInputChange = (field: string, value: string) => {
        let formattedValue = value;

        // Format card number with spaces
        if (field === "cardNumber") {
            formattedValue = value
                .replace(/\s/g, "")
                .replace(/(.{4})/g, "$1 ")
                .trim();
        }

        // Format expiry date with slash
        if (field === "expiryDate") {
            formattedValue = value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2");
        }

        setPaymentData((prev) => ({ ...prev, [field]: formattedValue }));
    };

    const handleRemoveFromCart = () => {
        dispatch(removeServiceFromCart());
        navigate(-1);
    };

    const handlePayment = async () => {
        if (!cartService) {
            toast.error("No hay servicio en el carrito");
            return;
        }

        // Validate payment data
        if (!paymentData.cardholderName.trim()) {
            toast.error("Por favor ingresa el nombre del titular de la tarjeta");
            return;
        }

        if (!paymentData.cardNumber.replace(/\s/g, "")) {
            toast.error("Por favor ingresa el número de tarjeta");
            return;
        }

        if (!paymentData.expiryDate) {
            toast.error("Por favor ingresa la fecha de vencimiento");
            return;
        }

        if (!paymentData.cvv) {
            toast.error("Por favor ingresa el CVV");
            return;
        }

        if (!paymentData.country) {
            toast.error("Por favor selecciona un país");
            return;
        }

        setIsProcessingPayment(true);

        try {
            // Create hiring request with day and time instead of date
            const hiringRequest: CreateHiringRequest = {
                serviceId: cartService.id,
                day: cartService.selectedDay, // e.g., "Monday", "Tuesday", etc.
                time: cartService.selectedTime, // e.g., "14:30"
                payment: {
                    name: paymentData.cardholderName,
                    cardNumber: paymentData.cardNumber.replace(/\s/g, ""),
                    expiry: paymentData.expiryDate,
                    cvv: paymentData.cvv,
                },
            };
            // Create the hiring
            await hiringService.createHiring(hiringRequest);

            // Clear cart
            dispatch(removeServiceFromCart());

            // Show success message
            toast.success(
                "¡Reserva creada exitosamente! El entrenador recibirá una notificación."
            );

            // Navigate to profile or hiring details
            navigate("/my-services", { replace: true });
        } catch (error: unknown) {
            console.error("Error creating hiring:", error);

            // Handle different types of errors
            let errorMessage = "Error al procesar el pago. Intenta nuevamente.";

            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (error && typeof error === "object" && "response" in error) {
                const responseError = error as {
                    response?: { data?: { message?: string } };
                };
                if (responseError.response?.data?.message) {
                    errorMessage = responseError.response.data.message;
                }
            } else if (typeof error === "string") {
                errorMessage = error;
            }

            toast.error(errorMessage);
        } finally {
            setIsProcessingPayment(false);
        }
    };

    if (!cartService) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <CreditCard className="size-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Tu carrito está vacío
                </h2>
                <p className="text-gray-600 mb-6">
                    Agrega un servicio para continuar con tu reserva
                </p>
                <Link to="/">
                    <Button>Explorar servicios</Button>
                </Link>
            </div>
        );
    }

    const serviceTotal = cartService.price;
    const serviceFee = 5;
    const total = serviceTotal + serviceFee;

    return (
        <div className="max-w-6xl mx-auto py-6">
            <div className="flex items-center gap-2 mb-6">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                    <ArrowLeft className="size-4" />
                </Button>
                <h1 className="text-xl font-semibold">Confirmá tu carrito</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Payment Form */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Paga con</span>
                                <div className="flex gap-1">
                                    <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                                        VISA
                                    </div>
                                    <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">
                                        MC
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="cardholderName">Nombre del titular</Label>
                                <Input
                                    id="cardholderName"
                                    placeholder="Nombre del titular de la tarjeta"
                                    value={paymentData.cardholderName}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "cardholderName",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="cardNumber">Número de tarjeta</Label>
                                <Input
                                    id="cardNumber"
                                    placeholder="Número de tarjeta"
                                    value={paymentData.cardNumber}
                                    onChange={(e) =>
                                        handleInputChange("cardNumber", e.target.value)
                                    }
                                    maxLength={19}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="expiry">Vencimiento</Label>
                                    <Input
                                        id="expiry"
                                        placeholder="MM/AA"
                                        value={paymentData.expiryDate}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "expiryDate",
                                                e.target.value
                                            )
                                        }
                                        maxLength={5}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="cvv">CVV</Label>
                                    <Input
                                        id="cvv"
                                        placeholder="CVV"
                                        value={paymentData.cvv}
                                        onChange={(e) =>
                                            handleInputChange("cvv", e.target.value)
                                        }
                                        maxLength={4}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="postalCode">Código Postal</Label>
                                <Input
                                    id="postalCode"
                                    placeholder="Código Postal"
                                    value={paymentData.postalCode}
                                    onChange={(e) =>
                                        handleInputChange("postalCode", e.target.value)
                                    }
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="country">País / Región</Label>
                                <Select
                                    value={paymentData.country}
                                    onValueChange={(value) =>
                                        handleInputChange("country", value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un país o región" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ar">Argentina</SelectItem>
                                        <SelectItem value="br">Brasil</SelectItem>
                                        <SelectItem value="cl">Chile</SelectItem>
                                        <SelectItem value="co">Colombia</SelectItem>
                                        <SelectItem value="mx">México</SelectItem>
                                        <SelectItem value="pe">Perú</SelectItem>
                                        <SelectItem value="uy">Uruguay</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                size="lg"
                                onClick={handlePayment}
                                disabled={isProcessingPayment}
                            >
                                {isProcessingPayment
                                    ? "Procesando..."
                                    : "Contratar Servicio"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Service Details */}
                <div className="space-y-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="size-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                    {cartService.trainerImage ? (
                                        <img
                                            src={cartService.trainerImage}
                                            alt={cartService.trainerName}
                                            className="size-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <User className="size-6 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-lg truncate">
                                        {cartService.trainerName}
                                    </h3>
                                    <div className="flex items-center gap-1 mt-1">
                                        <span className="text-yellow-500">★</span>
                                        <span className="text-sm text-muted-foreground">
                                            4.5 · 124 evaluaciones
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 border-t pt-4">
                                <h4 className="font-medium">Detalles del precio</h4>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>{cartService.description}</span>
                                        <span>${serviceTotal}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Servicio</span>
                                        <span>${serviceFee}</span>
                                    </div>
                                </div>

                                <div className="border-t pt-2">
                                    <div className="flex justify-between font-semibold">
                                        <span>Total</span>
                                        <span>${total}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 pt-4 border-t">
                                <h4 className="font-medium mb-2">Horario Seleccionado</h4>
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-medium">
                                        {cartService.selectedDay}
                                    </span>{" "}
                                    a las{" "}
                                    <span className="font-medium">
                                        {cartService.selectedTime}
                                    </span>
                                </p>
                            </div>

                            <div className="mt-4">
                                <h4 className="font-medium mb-2">
                                    Detalles del Servicio
                                </h4>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <p>
                                        <span className="font-medium">Duración:</span>{" "}
                                        {cartService.duration} minutos
                                    </p>
                                    <p>
                                        <span className="font-medium">Zona:</span>{" "}
                                        {cartService.zone}
                                    </p>
                                    <p>
                                        <span className="font-medium">Modalidad:</span>{" "}
                                        {cartService.mode === "online"
                                            ? "Virtual"
                                            : "Presencial"}
                                    </p>
                                    <p>
                                        <span className="font-medium">Idioma:</span>{" "}
                                        {cartService.language}
                                    </p>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                className="w-full mt-4"
                                onClick={handleRemoveFromCart}
                                disabled={isProcessingPayment}
                            >
                                Remover del Carrito
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CartConfirmationPage;
