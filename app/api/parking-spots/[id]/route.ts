import { NextRequest, NextResponse } from "next/server";

// GET /api/parking-spots/[id] - Récupérer les détails d'une place spécifique
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const Params = await params;
  try {
    console.log(`Recherche de la place avec l'ID: ${Params.id}`);

    // 1. Récupérer toutes les données de Montréal (même logique que la liste)
    const montrealApiUrl =
      "https://donnees.montreal.ca/dataset/8ac6dd33-b0d3-4eab-a334-5a6283eb7940/resource/52cecff0-2644-4258-a2d1-0c4b3b116117/download/signalisation_stationnement.geojson";

    console.log("Connexion à l'API de Montréal...");
    const response = await fetch(montrealApiUrl);

    if (!response.ok) {
      throw new Error(`Erreur API Montréal: ${response.status}`);
    }

    console.log("Données reçues, recherche de la place...");
    const montrealData = await response.json();

    // 2. Filtrer pour les places payantes
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

    // 3. Chercher la place spécifique par ID
    let targetSpot = null;

    // Recherche dans les données de Montréal
    for (let i = 0; i < paidParkingSpots.length; i++) {
      const feature = paidParkingSpots[i];
      const props = feature.properties;
      const spotId = props.PANNEAU_ID_PAN?.toString() || `mtl-${i}`;

      if (spotId === Params.id) {
        const coords = feature.geometry.coordinates;

        targetSpot = {
          // Données de base de Montréal
          parkingSpotId: spotId,
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
          pricePerHour: 3.5,
        };

        const isAvailable = Math.random() > 0.3;
        targetSpot = {
          ...targetSpot,
          isAvailable: isAvailable,
          canReserve: isAvailable ? true : false,
          maxDuration: 120, // 2h max

          // Détails supplémentaires pour la vue détaillée
          features: ["Parcomètre", "Éclairage nocturne"],
          restrictions: props.DESCRIPTION_RPA || "Lun-Ven 9h-17h",
          nearbyLandmarks: ["Métro", "Commerce"],

          // Informations de disponibilité simulées
          nextAvailable: new Date(
            Date.now() + Math.random() * 7200000
          ).toISOString(), // Dans les 2h

          // Métadonnées
          source: "montreal-opendata",
          lastUpdated: new Date().toISOString(),
        };
        break;
      }
    }

    // 4. Vérifier si la place existe
    if (!targetSpot) {
      console.log(`Place ${Params.id} non trouvée`);
      return NextResponse.json(
        {
          success: false,
          error: "Place de stationnement non trouvée",
          message: `Aucune place avec l'ID ${Params.id}`,
        },
        { status: 404 }
      );
    }

    console.log(`Place ${Params.id} trouvée: ${targetSpot.name}`);

    // 5. Réponse avec la place trouvée
    const apiResponse = {
      success: true,
      data: targetSpot,
      meta: {
        searchedId: Params.id,
        source: "Données ouvertes Ville de Montréal",
        retrievedAt: new Date().toISOString(),
      },
    };

    return NextResponse.json(apiResponse);
  } catch (error) {
    console.error(
      `Erreur lors de la recherche de la place ${Params.id}:`,
      error
    );

    // Fallback : place de démonstration si l'API échoue
    if (Params.id === "fallback-1" || error) {
      const fallbackSpot = {
        parkingSpotId: Params.id,
        name: "Place de stationnement - Plateau (Demo)",
        address: "Rue Saint-Denis, Le Plateau-Mont-Royal",
        description: "Place de démonstration pour les tests",
        coordinates: { lat: 45.5276, lng: -73.592 },
        arrondissement: "Le Plateau-Mont-Royal",
        pricePerHour: 3.5,
        isAvailable: true,
        canReserve: true,
        maxDuration: 120,
        features: ["Parcomètre", "Éclairage", "Accessible PMR"],
        restrictions: "Lun-Ven 9h-18h",
        nearbyLandmarks: ["Métro Mont-Royal", "Parc La Fontaine"],
        nextAvailable: new Date().toISOString(),
        averageOccupancy: 75,
        source: "fallback-demo",
        lastUpdated: new Date().toISOString(),
      };

      return NextResponse.json(
        {
          success: false,
          error: "API Montréal indisponible",
          data: fallbackSpot,
          meta: {
            fallback: true,
            searchedId: Params.id,
          },
        },
        { status: 206 }
      ); // 206 = Contenu partiel
    }

    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de la recherche",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
