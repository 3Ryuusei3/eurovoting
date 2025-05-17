import { Entry } from "@/types/Room";
import { BetOption } from "@/types/Bet";

/**
 * Convierte un objeto BetOption a un objeto Entry para poder usar el componente EntryInfo
 */
export function betOptionToEntry(betOption: BetOption | undefined): Entry | null {
  if (!betOption) return null;
  
  return {
    id: betOption.id,
    song: betOption.song,
    artist: betOption.artist,
    year: new Date().getFullYear(),
    running_order: betOption.running_order,
    country: {
      id: 0, // No tenemos el ID real del país, pero no es necesario para el renderizado
      name_es: betOption.country_name,
      flag: betOption.country_flag,
      flag_square: betOption.country_squared,
      name_en: betOption.country_name
    }
  };
}

/**
 * Convierte un objeto BetSummary a un objeto Entry para poder usar el componente EntryInfo
 */
export function betSummaryToEntry(betSummary: {
  entry_id: number;
  country_name: string;
  country_flag: string;
  country_squared: string;
  song: string;
  artist: string;
}): Entry {
  return {
    id: betSummary.entry_id,
    song: betSummary.song,
    artist: betSummary.artist,
    year: new Date().getFullYear(),
    running_order: 0, // No tenemos el running_order, pero podemos dejarlo en 0
    country: {
      id: 0,
      name_es: betSummary.country_name,
      flag: betSummary.country_flag,
      flag_square: betSummary.country_squared,
      name_en: betSummary.country_name
    }
  };
}
