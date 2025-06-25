import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { config } from "../src/config/index";

// Import all models
import User from "../src/features/user/user.model";
import Service from "../src/features/services/services.model";
import Hiring from "../src/features/hiring/hiring.model";
import Review from "../src/features/reviews/reviews.model";
import Archive from "../src/features/archives/archives.model";

// Mock data generators
const generateUsers = async (count: number = 20) => {
    const users: any[] = [];
    const roles = ["cliente", "entrenador"] as const;
    const menNames = ["Juan", "Carlos", "Luis", "Pedro", "Miguel"];
    const womenNames = ["Ana", "Laura", "Elena", "Carmen", "María"];
    const surnames = [
        "García",
        "Rodríguez",
        "López",
        "Martínez",
        "González",
        "Pérez",
        "Sánchez",
        "Ramírez",
        "Cruz",
        "Torres",
    ];

    const menImages = [
        "https://randomuser.me/api/portraits/men/32.jpg",
        "https://randomuser.me/api/portraits/men/33.jpg",
        "https://randomuser.me/api/portraits/men/34.jpg",
        "https://randomuser.me/api/portraits/men/35.jpg",
        "https://randomuser.me/api/portraits/men/36.jpg",
    ];

    const womenImages = [
        "https://randomuser.me/api/portraits/women/84.jpg",
        "https://randomuser.me/api/portraits/women/85.jpg",
        "https://randomuser.me/api/portraits/women/86.jpg",
        "https://randomuser.me/api/portraits/women/87.jpg",
        "https://randomuser.me/api/portraits/women/88.jpg",
        "https://randomuser.me/api/portraits/women/89.jpg",
        "https://randomuser.me/api/portraits/women/90.jpg",
    ];

    for (let i = 0; i < count; i++) {
        const gender = Math.random() > 0.5 ? "male" : "female";
        const name =
            gender === "male"
                ? menNames[Math.floor(Math.random() * menNames.length)]
                : womenNames[Math.floor(Math.random() * womenNames.length)];
        const surname = surnames[Math.floor(Math.random() * surnames.length)];
        const role =
            i < 8 ? "entrenador" : roles[Math.floor(Math.random() * roles.length)]; // Ensure we have trainers
        const hashedPassword = await bcrypt.hash("password123", 10);

        const notifications: any[] = [];
        if (Math.random() > 0.5) {
            notifications.push({
                _id: new mongoose.Types.ObjectId(),
                message: `Bienvenido a Stronget Market, ${name}!`,
                leido: Math.random() > 0.5,
                date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            });
        }

        users.push({
            name,
            surname,
            email: `${name.toLowerCase()}.${surname.toLowerCase()}${i}@example.com`,
            password: hashedPassword,
            birthDay: new Date(
                1980 + Math.floor(Math.random() * 30),
                Math.floor(Math.random() * 12),
                Math.floor(Math.random() * 28) + 1
            ),
            role,
            avatar:
                gender === "male"
                    ? menImages[Math.floor(Math.random() * menImages.length)]
                    : womenImages[Math.floor(Math.random() * womenImages.length)],
            notifications,
            createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(),
        });
    }

    return users;
};

const generateServices = (trainers: any[], count: number = 30) => {
    const services: any[] = [];
    const categories = [
        "Fitness",
        "Yoga",
        "CrossFit",
        "Pilates",
        "Boxeo",
        "Natación",
        "Running",
        "Nutrición",
        "Rehabilitación",
    ];
    const modes = ["online", "in-person"] as const;
    const zones = ["Norte", "Sur", "Este", "Oeste", "Centro", "Zona Metropolitana"];
    const languages = ["Español", "Inglés", "Francés", "Italiano"];
    const days = [
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
        "Domingo",
    ];
    const times = [
        "08:00",
        "09:00",
        "10:00",
        "11:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
        "18:00",
        "19:00",
    ];

    const descriptions = [
        "Entrenamiento personalizado para mejorar tu condición física",
        "Clases de yoga para principiantes y avanzados",
        "Sesiones intensivas de CrossFit",
        "Pilates para fortalecer tu core",
        "Clases de boxeo para todos los niveles",
        "Entrenamiento de natación técnica",
        "Running coaching personalizado",
        "Asesoría nutricional completa",
        "Rehabilitación y fisioterapia deportiva",
    ];

    for (let i = 0; i < count; i++) {
        const trainer = trainers[Math.floor(Math.random() * trainers.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];
        const availabilityCount = Math.floor(Math.random() * 4) + 1;
        const availability: any[] = [];

        for (let j = 0; j < availabilityCount; j++) {
            availability.push({
                day: days[Math.floor(Math.random() * days.length)],
                startTime: times[Math.floor(Math.random() * times.length)],
            });
        }

        services.push({
            trainerId: trainer._id,
            category,
            description: descriptions[Math.floor(Math.random() * descriptions.length)],
            duration: [30, 45, 60, 90, 120][Math.floor(Math.random() * 5)],
            price: Math.floor(Math.random() * 100) + 20,
            mode: modes[Math.floor(Math.random() * modes.length)],
            zone: zones[Math.floor(Math.random() * zones.length)],
            language: languages[Math.floor(Math.random() * languages.length)],
            maxPeople: Math.floor(Math.random() * 10) + 1,
            status: Math.random() > 0.1 ? "active" : "inactive",
            availability,
            visualizations: Math.floor(Math.random() * 500),
            viewedBy: [],
            isActive: true,
            createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(),
        });
    }

    return services;
};

const generateHirings = (services: any[], clients: any[], count: number = 50) => {
    const hirings: any[] = [];
    const statuses = [
        "pending",
        "confirmed",
        "cancelled",
        "rejected",
        "completed",
    ] as const;
    const days = [
        "2024-01-15",
        "2024-01-16",
        "2024-01-17",
        "2024-01-18",
        "2024-01-19",
        "2024-01-22",
        "2024-01-23",
    ];
    const times = [
        "08:00",
        "09:00",
        "10:00",
        "11:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
        "18:00",
        "19:00",
    ];
    const names = [
        "Juan Pérez",
        "María García",
        "Carlos López",
        "Ana Martínez",
        "Luis González",
    ];

    for (let i = 0; i < count; i++) {
        const service = services[Math.floor(Math.random() * services.length)];
        const client = clients[Math.floor(Math.random() * clients.length)];

        hirings.push({
            serviceId: service._id,
            clientId: client._id,
            trainerId: service.trainerId,
            day: days[Math.floor(Math.random() * days.length)],
            time: times[Math.floor(Math.random() * times.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            payment: {
                name: names[Math.floor(Math.random() * names.length)],
                cardNumber: `****-****-****-${Math.floor(Math.random() * 9000) + 1000}`,
                expiry: `${Math.floor(Math.random() * 12) + 1}/2026`,
                cvv: `${Math.floor(Math.random() * 900) + 100}`,
            },
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(),
        });
    }

    return hirings;
};

const generateReviews = (services: any[], clients: any[], count: number = 40) => {
    const reviews: any[] = [];
    const usedCombinations = new Set<string>();
    const comments = [
        "Excelente entrenador, muy profesional y dedicado",
        "Me ayudó mucho a mejorar mi técnica, lo recomiendo",
        "Muy buena experiencia, volveré a contratar sus servicios",
        "Profesional y puntual, excelente calidad de servicio",
        "Superó mis expectativas, muy satisfecho con los resultados",
        "Buen entrenador pero podría mejorar la comunicación",
        "Muy motivador y con excelente conocimiento técnico",
        "Perfecto para principiantes, muy paciente y explicativo",
        "Entrenamiento intenso y efectivo, lo recomiendo ampliamente",
        "Muy profesional, adaptó el entrenamiento a mis necesidades",
    ];

    const responses = [
        "Muchas gracias por tu comentario, fue un placer trabajar contigo",
        "Me alegra saber que lograste tus objetivos, sigamos trabajando",
        "Gracias por la confianza, espero verte pronto",
        "Aprecio mucho tu feedback, seguiré mejorando",
        "Fue genial entrenar contigo, nos vemos en la próxima sesión",
    ];

    let attempts = 0;
    const maxAttempts = count * 10; // Prevent infinite loop

    while (reviews.length < count && attempts < maxAttempts) {
        attempts++;

        const service = services[Math.floor(Math.random() * services.length)];
        const client = clients[Math.floor(Math.random() * clients.length)];
        const combinationKey = `${client._id.toString()}-${service._id.toString()}`;

        // Skip if this user already reviewed this service
        if (usedCombinations.has(combinationKey)) {
            continue;
        }

        usedCombinations.add(combinationKey);

        reviews.push({
            serviceId: service._id,
            user: client._id,
            trainerId: service.trainerId,
            calification: Math.floor(Math.random() * 5) + 1,
            comments: comments[Math.floor(Math.random() * comments.length)],
            date: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
            response:
                Math.random() > 0.5
                    ? responses[Math.floor(Math.random() * responses.length)]
                    : null,
            createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(),
        });
    }

    return reviews;
};

const generateArchives = (hirings: any[], users: any[], count: number = 25) => {
    const archives: any[] = [];
    const fileTypes = [
        { ext: "pdf", mime: "application/pdf", name: "routine" },
        { ext: "jpg", mime: "image/jpeg", name: "progress_photo" },
        { ext: "png", mime: "image/png", name: "exercise_chart" },
        { ext: "mp4", mime: "video/mp4", name: "exercise_demo" },
        {
            ext: "docx",
            mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            name: "plan",
        },
    ];

    for (let i = 0; i < count; i++) {
        const hiring = hirings[Math.floor(Math.random() * hirings.length)];
        const user = users[Math.floor(Math.random() * users.length)];
        const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
        const fileName = `${fileType.name}_${i + 1}.${fileType.ext}`;
        const fileSize = Math.floor(Math.random() * 5000000) + 100000; // 100KB to 5MB

        archives.push({
            hiringId: hiring._id,
            uploadedBy: user._id,
            fileName,
            originalName: fileName,
            fileSize,
            mimeType: fileType.mime,
            fileUrl: `https://storage.example.com/files/${fileName}`,
            fileKey: `uploads/${hiring._id}/${fileName}`,
            uploadDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            isActive: true,
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(),
        });
    }

    return archives;
};

const seedDatabase = async () => {
    try {
        console.log("🌱 Starting database seeding...");

        // Connect to MongoDB
        await mongoose.connect(config.mongoUri as string);
        console.log("✅ Connected to MongoDB");

        // Clear existing data
        console.log("🗑️  Clearing existing data...");
        await Promise.all([
            User.deleteMany({}),
            Service.deleteMany({}),
            Hiring.deleteMany({}),
            Review.deleteMany({}),
            Archive.deleteMany({}),
        ]);
        console.log("✅ Existing data cleared");

        // Drop existing indexes to avoid conflicts with old schema
        console.log("🗂️  Dropping existing indexes...");
        try {
            await Review.collection.dropIndexes();
            console.log("✅ Reviews indexes dropped");
        } catch (error) {
            console.log(
                "⚠️  No indexes to drop for reviews or error dropping:",
                (error as Error).message
            );
        }

        // Generate and insert users
        console.log("👥 Creating users...");
        const usersData = await generateUsers(20);
        const users = await User.insertMany(usersData);
        console.log(`✅ Created ${users.length} users`);

        // Separate trainers and clients
        const trainers = users.filter((user) => user.role === "entrenador");
        const clients = users.filter((user) => user.role === "cliente");
        console.log(`   - ${trainers.length} trainers`);
        console.log(`   - ${clients.length} clients`);

        // Generate and insert services
        console.log("🏋️  Creating services...");
        const servicesData = generateServices(trainers, 30);
        const services = await Service.insertMany(servicesData);
        console.log(`✅ Created ${services.length} services`);

        // Generate and insert hirings
        console.log("📅 Creating hirings...");
        const hiringsData = generateHirings(services, clients, 50);
        const hirings = await Hiring.insertMany(hiringsData);
        console.log(`✅ Created ${hirings.length} hirings`);

        // Generate and insert reviews
        console.log("⭐ Creating reviews...");
        const reviewsData = generateReviews(services, clients, 40);
        const reviews = await Review.insertMany(reviewsData);
        console.log(`✅ Created ${reviews.length} reviews`);

        // Generate and insert archives
        console.log("📁 Creating archives...");
        const archivesData = generateArchives(hirings, users, 25);
        const archives = await Archive.insertMany(archivesData);
        console.log(`✅ Created ${archives.length} archives`);

        console.log("\n🎉 Database seeding completed successfully!");
        console.log("📊 Summary:");
        console.log(`   - Users: ${users.length}`);
        console.log(`   - Services: ${services.length}`);
        console.log(`   - Hirings: ${hirings.length}`);
        console.log(`   - Reviews: ${reviews.length}`);
        console.log(`   - Archives: ${archives.length}`);
    } catch (error) {
        console.error("❌ Error seeding database:", error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log("🔌 Database connection closed");
        process.exit(0);
    }
};

// Run the seeding script
if (require.main === module) {
    seedDatabase();
}

export default seedDatabase;
