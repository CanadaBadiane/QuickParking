import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Récupérer les données de l'API de Montréal
    const montrealApiUrl =
      "https://donnees.montreal.ca/dataset/8ac6dd33-b0d3-4eab-a334-5a6283eb7940/resource/52cecff0-2644-4258-a2d1-0c4b3b116117/download/signalisation_stationnement.geojson";

    console.log("Récupération des données de Montréal...");
    const response = await fetch(montrealApiUrl);

    if (!response.ok) {
      throw new Error(`Erreur API Montréal: ${response.status}`);
    }

    const montrealData = await response.json();
    console.log(`${montrealData.features?.length} panneaux récupérés`);

    // 2. Filtrer pour ne garder que les parcomètres
    const paidParkingSpots =
      montrealData.features?.filter((feature: any) => {
        const description =
          feature.properties.DESCRIPTION_RPA?.toLowerCase() || "";
        return (
          description.includes("payant") ||
          description.includes("parcomètre") ||
          description.includes("stationnement tarifé")
        );
      }) || [];

    console.log(`${paidParkingSpots.length} places payantes trouvées`);

    // 3. Transformer les données + ajouter mes fonctionnalités
    const enhancedParkingSpots = paidParkingSpots
      .slice(0, 50)
      .map((feature: any, index: number) => {
        const props = feature.properties;
        const coords = feature.geometry.coordinates; // [longitude, latitude]

        return {
          // Données de base de Montréal
          id: props.PANNEAU_ID_PAN?.toString() || `mtl-${index}`,
          name: `Place de stationnement - ${props.NOM_ARROND || "Montréal"}`,
          address: `${props.TOPONYME_PAN || "Rue inconnue"}, ${
            props.NOM_ARROND || "Montréal"
          }`,
          description:
            props.DESCRIPTION_RPA || "Place de stationnement payante",
          coordinates: {
            lat: coords[1], // latitude
            lng: coords[0], // longitude
          },
          arrondissement: props.NOM_ARROND,

          pricePerHour: 3.5, // Prix moyen à Montréal
          isAvailable: Math.random() > 0.3, // 70% de chance d'être disponible
          canReserve: true, // Fonctionnalité de réservation
          maxDuration: 120, // 2h max

          // Métadonnées
          source: "montreal-opendata",
          lastUpdated: new Date().toISOString(),
        };
      });

    // 4. Réponse avec métadonnées
    const apiResponse = {
      success: true,
      data: enhancedParkingSpots,
      meta: {
        totalFromMontreal: montrealData.features?.length || 0,
        filteredPaidSpots: paidParkingSpots.length,
        returned: enhancedParkingSpots.length,
        source: "Données ouvertes Ville de Montréal",
        lastUpdated: new Date().toISOString(),
      },
    };

    return NextResponse.json(apiResponse);
  } catch (error) {
    console.error("Erreur:", error);

    // Fallback avec données fictives si l'API échoue
    const fallbackData = {
      success: false,
      error: "API Montréal indisponible",
      data: [
        {
          id: "fallback-1",
          name: "Place de stationnement - Plateau",
          address: "Rue Saint-Denis, Le Plateau-Mont-Royal",
          pricePerHour: 3.5,
          isAvailable: true,
          canReserve: true,
          coordinates: { lat: 45.5276, lng: -73.592 },
        },
      ],
    };

    return NextResponse.json(fallbackData, { status: 206 }); // 206 = Contenu partiel
  }
}
