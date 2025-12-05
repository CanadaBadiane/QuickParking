import prisma from "../lib/prisma";

const url =
  "https://donnees.montreal.ca/dataset/8ac6dd33-b0d3-4eab-a334-5a6283eb7940/resource/52cecff0-2644-4258-a2d1-0c4b3b116117/download/signalisation_stationnement.geojson";

async function main() {
  const response = await fetch(url);
  const data = await response.json();
  const features = data.features || [];

  // Filtrer les places payantes
  const filtered = features.filter((feature: any) => {
    const description = feature.properties.DESCRIPTION_RPA?.toLowerCase() || "";
    return (
      description.includes("payant") ||
      description.includes("parcomètre") ||
      description.includes("stationnement tarifé")
    );
  });

  // Préparer les données pour Prisma
  const spotsToInsert = filtered.map((feature: any, index: number) => {
    const props = feature.properties;
    const coords = feature.geometry.coordinates;
    return {
      parkingSpotId: props.PANNEAU_ID_PAN?.toString() || `mtl-${index}`,
      name: `Place de stationnement - ${props.NOM_ARROND || "Montréal"}`,
      description: props.DESCRIPTION_RPA || "Place de stationnement payante",
      lat: coords[1],
      lng: coords[0],
      arrondissement: props.NOM_ARROND,
      pricePerHour: 3.5,
      isAvailable: true,
      canReserve: true,
      maxDuration: 120,
      features: ["Parcomètre"],
      lastUpdated: new Date().toISOString(),
    };
  });

  await prisma.parkingSpot.createMany({
    data: spotsToInsert,
    skipDuplicates: true,
  });

  console.log(`Import terminé : ${spotsToInsert.length} places ajoutées.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
