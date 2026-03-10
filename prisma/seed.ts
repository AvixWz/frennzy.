import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import slugify from "slugify";

const prisma = new PrismaClient();

const treatmentData = [
  {
    name: "Heart Surgery",
    category: "Cardiology",
    procedure:
      "Comprehensive pre-operative diagnostics followed by minimally invasive or open cardiac procedure based on case complexity.",
    recovery:
      "Hospital stay 5-8 days, monitored cardiac rehabilitation for 4-6 weeks with tele-follow-ups.",
    costMin: 6000,
    costMax: 15000,
    faqs: [
      {
        question: "How long is recovery after heart surgery?",
        answer: "Most patients resume routine activity in 6-8 weeks with guided cardiac rehab."
      },
      {
        question: "Do hospitals offer international patient coordinators?",
        answer: "Yes, all partner hospitals provide dedicated coordinators and translator support."
      }
    ]
  },
  {
    name: "IVF",
    category: "Fertility",
    procedure:
      "Cycle planning, hormonal stimulation, egg retrieval, fertilization, embryo culture and transfer guided by fertility experts.",
    recovery:
      "Most patients return to routine activity in 24-48 hours post retrieval and transfer.",
    costMin: 2500,
    costMax: 7000,
    faqs: [
      {
        question: "What is the average IVF success rate?",
        answer: "Success rates vary by age and diagnosis, often ranging between 35% and 65% per cycle."
      },
      {
        question: "Can patients freeze embryos?",
        answer: "Yes, embryo cryopreservation options are available at partner centers."
      }
    ]
  },
  {
    name: "Orthopedic Surgery",
    category: "Orthopedics",
    procedure:
      "Advanced joint replacement and spine procedures supported by robotic navigation and 3D planning.",
    recovery:
      "Typical mobility starts within 24 hours; full rehabilitation spans 6-12 weeks based on procedure.",
    costMin: 4000,
    costMax: 12000,
    faqs: [
      {
        question: "Will I need physiotherapy?",
        answer: "Yes, structured physiotherapy is essential for optimal recovery and long-term outcomes."
      },
      {
        question: "How soon can I travel back?",
        answer: "Usually after 10-14 days once the surgeon clears post-op stability and mobility."
      }
    ]
  },
  {
    name: "Cosmetic Surgery",
    category: "Aesthetic",
    procedure:
      "Personalized surgical plan across facial and body procedures with pre-op simulation and safety checks.",
    recovery:
      "Recovery depends on procedure type; most patients require 5-14 days of assisted post-op care.",
    costMin: 3000,
    costMax: 10000,
    faqs: [
      {
        question: "Are scars visible after surgery?",
        answer: "Surgeons prioritize discreet incision planning and provide scar-care protocols."
      },
      {
        question: "Is follow-up included?",
        answer: "Yes, virtual and in-person follow-up care is included in treatment plans."
      }
    ]
  },
  {
    name: "Dental Implants",
    category: "Dental",
    procedure:
      "Digital smile planning, implant placement, osseointegration period, and final prosthetic restoration.",
    recovery:
      "Light discomfort for 2-3 days; complete implant integration generally takes 3-6 months.",
    costMin: 1200,
    costMax: 5500,
    faqs: [
      {
        question: "How long do implants last?",
        answer: "With good oral hygiene and follow-ups, implants can last over 15 years."
      },
      {
        question: "Is bone grafting always needed?",
        answer: "Not always; assessment is based on jaw bone density and implant stability requirements."
      }
    ]
  },
  {
    name: "Organ Transplant",
    category: "Transplant",
    procedure:
      "Multidisciplinary transplant protocol including donor matching, surgery, ICU care, and immunosuppression management.",
    recovery:
      "Hospital stay 2-4 weeks with strict infection control and long-term follow-up planning.",
    costMin: 18000,
    costMax: 60000,
    faqs: [
      {
        question: "Do you support legal documentation for transplants?",
        answer: "Yes, partner hospitals have dedicated transplant legal teams for compliance."
      },
      {
        question: "Can international families stay nearby?",
        answer: "Yes, accommodation and caregiver assistance are arranged by coordinators."
      }
    ]
  }
];

async function main() {
  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL ?? "admin@mediway.com";
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD ?? "ChangeThisStrongPassword123!";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash, role: UserRole.ADMIN, name: "Platform Admin" },
    create: {
      email: adminEmail,
      name: "Platform Admin",
      passwordHash,
      role: UserRole.ADMIN
    }
  });

  const apollo = await prisma.hospital.upsert({
    where: { slug: "apollo-hospitals-new-delhi" },
    update: {},
    create: {
      name: "Apollo Hospitals",
      slug: "apollo-hospitals-new-delhi",
      city: "New Delhi",
      overview:
        "JCI-accredited quaternary care center known for complex cardiac, oncology and transplant care for international patients.",
      accreditations: ["JCI", "NABH"],
      departments: ["Cardiology", "Oncology", "Orthopedics", "Transplant"],
      facilities: [
        "International patient lounge",
        "24/7 emergency",
        "Advanced imaging",
        "Dedicated interpreters"
      ],
      images: [
        "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1600&q=80"
      ],
      googleReviewUrl: "https://www.google.com/search?q=Apollo+Hospitals+New+Delhi+reviews",
      websiteUrl: "https://www.apollohospitals.com/",
      contactEmail: "apollo.intl@mediway.demo",
      contactPhone: "+91-11-4000-0001",
      seoTitle: "Apollo Hospitals New Delhi | Medical Tourism Partner",
      seoDescription:
        "Explore accredited care, specialties, and international patient services at Apollo Hospitals New Delhi."
    }
  });

  const fortis = await prisma.hospital.upsert({
    where: { slug: "fortis-memorial-gurugram" },
    update: {},
    create: {
      name: "Fortis Memorial Research Institute",
      slug: "fortis-memorial-gurugram",
      city: "Gurugram",
      overview:
        "High-end multispecialty center delivering advanced IVF, neurology, and robotic surgery programs.",
      accreditations: ["JCI", "NABH"],
      departments: ["IVF", "Neurology", "Orthopedics", "Aesthetic Surgery"],
      facilities: ["Robotic OR", "Luxury suites", "Tele-ICU", "Language support desk"],
      images: [
        "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1600&q=80"
      ],
      googleReviewUrl: "https://www.google.com/search?q=Fortis+Memorial+Research+Institute+reviews",
      websiteUrl: "https://www.fortishealthcare.com/",
      contactEmail: "fortis.intl@mediway.demo",
      contactPhone: "+91-124-500-0002",
      seoTitle: "Fortis Memorial Gurugram | International Patient Services",
      seoDescription:
        "Discover advanced treatment programs and trusted medical tourism support at Fortis Memorial Gurugram."
    }
  });

  const medanta = await prisma.hospital.upsert({
    where: { slug: "medanta-gurugram" },
    update: {},
    create: {
      name: "Medanta - The Medicity",
      slug: "medanta-gurugram",
      city: "Gurugram",
      overview:
        "Large integrated health city offering multidisciplinary programs for complex international cases.",
      accreditations: ["JCI", "NABH"],
      departments: ["Cardiac Sciences", "Neurosciences", "Transplant", "Digestive Diseases"],
      facilities: ["Dedicated visa team", "Airport transfer", "Companion stay", "Global insurance desk"],
      images: [
        "https://images.unsplash.com/photo-1486825586573-7131f7991bdd?auto=format&fit=crop&w=1600&q=80"
      ],
      googleReviewUrl: "https://www.google.com/search?q=Medanta+The+Medicity+reviews",
      websiteUrl: "https://www.medanta.org/",
      contactEmail: "medanta.intl@mediway.demo",
      contactPhone: "+91-124-600-0003",
      seoTitle: "Medanta Gurugram | Trusted Medical Tourism Care",
      seoDescription:
        "Get complete treatment planning and post-care support at Medanta Gurugram for global patients."
    }
  });

  const hospitals = [apollo, fortis, medanta];

  const doctors = await Promise.all([
    prisma.doctor.upsert({
      where: { slug: "dr-rajesh-mehra-cardiac-surgeon" },
      update: {},
      create: {
        name: "Dr. Rajesh Mehra",
        slug: "dr-rajesh-mehra-cardiac-surgeon",
        imageUrl:
          "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80",
        googleReviewUrl: "https://www.google.com/search?q=Dr+Rajesh+Mehra+cardiac+surgeon+reviews",
        websiteUrl: "https://www.apollohospitals.com/doctors/",
        specialization: "Cardiac Surgeon",
        experienceYears: 22,
        city: "New Delhi",
        languages: ["English", "Hindi", "Arabic"],
        education: "MBBS, MS, MCh (Cardiothoracic Surgery)",
        certifications: ["FRCS", "AATS Fellowship"],
        biography:
          "Known for complex bypass and valve surgeries with high success rates in international high-risk cohorts.",
        patientReviews: [
          { title: "Trusted hands", rating: 5, text: "Clear communication and excellent outcomes." },
          { title: "Very supportive", rating: 5, text: "The team guided us from visa to discharge." }
        ],
        consultationFee: 120,
        hospitalId: apollo.id,
        seoTitle: "Dr. Rajesh Mehra - Cardiac Surgeon in New Delhi",
        seoDescription:
          "View profile, qualifications, and consultation details for Dr. Rajesh Mehra, leading cardiac surgeon."
      }
    }),
    prisma.doctor.upsert({
      where: { slug: "dr-anita-kapoor-ivf-specialist" },
      update: {},
      create: {
        name: "Dr. Anita Kapoor",
        slug: "dr-anita-kapoor-ivf-specialist",
        imageUrl:
          "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&w=800&q=80",
        googleReviewUrl: "https://www.google.com/search?q=Dr+Anita+Kapoor+IVF+specialist+reviews",
        websiteUrl: "https://www.fortishealthcare.com/specialities/ivf",
        specialization: "IVF Specialist",
        experienceYears: 16,
        city: "Gurugram",
        languages: ["English", "Hindi", "French"],
        education: "MBBS, MD (OBG), Fellowship in Reproductive Medicine",
        certifications: ["ESHRE Certified"],
        biography:
          "Leads personalized fertility treatment programs with strong outcomes for cross-border patients.",
        patientReviews: [
          { title: "Excellent IVF guidance", rating: 5, text: "Everything was explained with patience." }
        ],
        consultationFee: 90,
        hospitalId: fortis.id,
        seoTitle: "Dr. Anita Kapoor - IVF Specialist in Gurugram",
        seoDescription:
          "Explore Dr. Anita Kapoor's IVF expertise, credentials, and fertility consultation process."
      }
    }),
    prisma.doctor.upsert({
      where: { slug: "dr-vikram-singh-orthopedic-surgeon" },
      update: {},
      create: {
        name: "Dr. Vikram Singh",
        slug: "dr-vikram-singh-orthopedic-surgeon",
        imageUrl:
          "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=800&q=80",
        googleReviewUrl: "https://www.google.com/search?q=Dr+Vikram+Singh+orthopedic+surgeon+reviews",
        websiteUrl: "https://www.medanta.org/",
        specialization: "Orthopedic Surgeon",
        experienceYears: 18,
        city: "Gurugram",
        languages: ["English", "Hindi", "Russian"],
        education: "MBBS, MS (Orthopedics), Fellowship in Joint Replacement",
        certifications: ["AO Trauma", "ISKSAA"],
        biography:
          "Focuses on knee and hip replacements with accelerated recovery and rehab protocols.",
        patientReviews: [
          { title: "Great mobility outcomes", rating: 5, text: "Walking comfortably within days." }
        ],
        consultationFee: 95,
        hospitalId: medanta.id,
        seoTitle: "Dr. Vikram Singh - Orthopedic Surgeon in Gurugram",
        seoDescription:
          "Review profile of Dr. Vikram Singh for advanced joint replacement and orthopedic surgery."
      }
    })
  ]);

  const treatmentRecords = await Promise.all(
    treatmentData.map((item) =>
      prisma.treatment.upsert({
        where: { slug: slugify(item.name, { lower: true, strict: true }) },
        update: {},
        create: {
          ...item,
          slug: slugify(item.name, { lower: true, strict: true }),
          images: [
            "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=80",
            "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1600&q=80"
          ],
          seoTitle: `${item.name} in India | Cost, Recovery & Top Specialists`,
          seoDescription: `Learn about ${item.name} procedure, expected recovery, estimated costs and best hospitals in India.`
        }
      })
    )
  );

  for (const treatment of treatmentRecords) {
    for (const hospital of hospitals) {
      if (hospital.city === "Gurugram" || treatment.category === "Cardiology") {
        await prisma.hospitalTreatment.upsert({
          where: {
            hospitalId_treatmentId: {
              hospitalId: hospital.id,
              treatmentId: treatment.id
            }
          },
          update: {},
          create: { hospitalId: hospital.id, treatmentId: treatment.id }
        });
      }
    }

    for (const doctor of doctors) {
      const isMatch =
        (treatment.category === "Cardiology" && doctor.specialization.includes("Cardiac")) ||
        (treatment.category === "Fertility" && doctor.specialization.includes("IVF")) ||
        (treatment.category === "Orthopedics" && doctor.specialization.includes("Orthopedic"));

      if (isMatch) {
        await prisma.doctorTreatment.upsert({
          where: {
            doctorId_treatmentId: {
              doctorId: doctor.id,
              treatmentId: treatment.id
            }
          },
          update: {},
          create: {
            doctorId: doctor.id,
            treatmentId: treatment.id
          }
        });
      }
    }
  }

  await prisma.blogPost.upsert({
    where: { slug: "medical-tourism-india-complete-guide" },
    update: {},
    create: {
      title: "Medical Tourism in India: Complete Guide for International Patients",
      slug: "medical-tourism-india-complete-guide",
      excerpt:
        "Understand costs, hospital selection, travel planning, and post-treatment support for a seamless medical trip to India.",
      featuredImage:
        "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?auto=format&fit=crop&w=1600&q=80",
      category: "Medical Tourism",
      tags: ["medical tourism", "india healthcare", "patient travel"],
      authorName: "Dr. Priya Nair",
      authorTitle: "Clinical Strategy Lead",
      published: true,
      publishedAt: new Date("2025-11-15T10:00:00Z"),
      readTimeMinutes: 8,
      seoTitle: "Medical Tourism in India Guide 2026",
      seoDescription:
        "A practical guide covering treatment planning, cost, visa support, and quality benchmarks for medical tourism in India.",
      content: `
        <h2>Why Patients Choose India</h2>
        <p>India offers internationally accredited hospitals, specialist doctors, and comprehensive patient support at highly competitive costs.</p>
        <h2>How to Plan Treatment</h2>
        <p>Start with medical records review, compare specialist options, confirm treatment plan, and finalize travel and accommodation timelines.</p>
        <h2>What Support to Expect</h2>
        <p>Dedicated coordinators assist with visa letters, airport pickup, interpretation, admissions, billing, and follow-up after returning home.</p>
      `
    }
  });

  await prisma.blogPost.upsert({
    where: { slug: "heart-surgery-cost-india-vs-usa" },
    update: {},
    create: {
      title: "Heart Surgery Cost in India vs USA: A Transparent Comparison",
      slug: "heart-surgery-cost-india-vs-usa",
      excerpt:
        "Compare realistic treatment packages, hospital stay, and recovery support for major cardiac procedures.",
      featuredImage:
        "https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?auto=format&fit=crop&w=1600&q=80",
      category: "Cardiology",
      tags: ["heart surgery", "cost comparison", "cardiology"],
      authorName: "Mediway Editorial Team",
      authorTitle: "Patient Education",
      published: true,
      publishedAt: new Date("2026-01-08T08:00:00Z"),
      readTimeMinutes: 6,
      seoTitle: "Heart Surgery Cost India vs USA",
      seoDescription:
        "Compare heart surgery pricing and patient outcomes between India and the USA with practical planning tips.",
      content: `
        <h2>Cost Snapshot</h2>
        <p>Heart surgery in India can often cost 60-80% less than equivalent procedures in the USA while maintaining high clinical standards.</p>
        <h2>What Is Included</h2>
        <p>Most international packages include surgeon fee, OT charges, ICU stay, room charges, and early post-op consultation.</p>
      `
    }
  });

  const linkedTreatment = treatmentRecords.find((item) => item.category === "Cardiology");
  const linkedDoctor = doctors.find((item) => item.specialization.includes("Cardiac"));

  await prisma.testimonial.createMany({
    data: [
      {
        patientName: "Michael Ross",
        country: "Kenya",
        city: "Nairobi",
        treatment: "Heart Surgery",
        comment:
          "From first consultation to post-op review, every step felt coordinated and transparent. I was back home safely within three weeks.",
        rating: 5,
        imageUrl:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
        doctorId: linkedDoctor?.id,
        treatmentId: linkedTreatment?.id,
        isPublished: true
      },
      {
        patientName: "Emma Njeri",
        country: "Tanzania",
        city: "Dar es Salaam",
        treatment: "IVF",
        comment:
          "The fertility team gave us clear milestones and emotional support. We always knew what came next.",
        rating: 5,
        imageUrl:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
        isPublished: true
      },
      {
        patientName: "Ahmed Saeed",
        country: "Oman",
        city: "Muscat",
        treatment: "Knee Replacement",
        comment:
          "Excellent surgery and rehab planning. I could walk with minimal pain in a few days.",
        rating: 4,
        imageUrl:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
        isPublished: true
      }
    ]
  });

  await prisma.inquiry.createMany({
    data: [
      {
        name: "Fatima Noor",
        country: "Bangladesh",
        phone: "+880-1700-000-001",
        email: "fatima@example.com",
        treatmentInterest: "IVF",
        message: "Looking for IVF treatment with 4-week travel timeline.",
        status: "NEW"
      },
      {
        name: "Joseph Mwangi",
        country: "Kenya",
        phone: "+254-700-000-101",
        email: "joseph@example.com",
        treatmentInterest: "Heart Surgery",
        message: "Please share estimate and required pre-op reports.",
        status: "CONTACTED"
      }
    ]
  });

  console.log("Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

