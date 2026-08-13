export interface CoordinateCandidate {
  latitude?: unknown;
  longitude?: unknown;
}

export type MappableCoordinates = CoordinateCandidate & {
  latitude: number;
  longitude: number;
};

/** Only coordinates supplied as finite, in-range numbers are mappable. */
export function hasValidCoordinates(
  project: CoordinateCandidate
): project is MappableCoordinates {
  return (
    typeof project.latitude === 'number' &&
    Number.isFinite(project.latitude) &&
    project.latitude >= -90 &&
    project.latitude <= 90 &&
    typeof project.longitude === 'number' &&
    Number.isFinite(project.longitude) &&
    project.longitude >= -180 &&
    project.longitude <= 180
  );
}
