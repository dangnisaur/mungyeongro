import type {
  Feedback,
  Pet,
  Place,
  RoutePlan,
  TagWeights,
  Visit,
} from "@/types/domain";

export interface PetInput {
  name: string;
  breed?: string | null;
  sizeClass: Pet["sizeClass"];
  weightKg?: number | null;
  ageYears?: number | null;
  energyLevel: number;
  sociability: number;
  prefersIndoor: boolean;
  notes?: string | null;
}

export interface VisitInput {
  petId: string;
  placeId: string;
  routeId?: string | null;
  visitedAt?: string;
}

/**
 * 데이터 접근 추상화.
 * 데모 모드(demo-repo)와 Supabase/Prisma 모드가 동일 인터페이스를 구현한다.
 */
export interface Repo {
  // places
  listPlaces(): Promise<Place[]>;
  getPlace(id: string): Promise<Place | null>;
  listVets(): Promise<Place[]>;

  // pets
  listPets(userId: string): Promise<Pet[]>;
  getPet(userId: string, id: string): Promise<Pet | null>;
  createPet(userId: string, input: PetInput): Promise<Pet>;
  updatePet(userId: string, id: string, input: PetInput): Promise<Pet | null>;
  deletePet(userId: string, id: string): Promise<boolean>;

  // routes
  createRoute(
    route: Omit<RoutePlan, "id" | "createdAt">,
  ): Promise<RoutePlan>;
  getRoute(id: string): Promise<RoutePlan | null>;
  listRoutes(userId: string): Promise<RoutePlan[]>;

  // visits & feedback
  createVisit(userId: string, input: VisitInput): Promise<Visit>;
  listVisits(userId: string): Promise<Visit[]>;
  setFeedback(
    userId: string,
    visitId: string,
    feedback: Omit<Feedback, "createdAt">,
  ): Promise<Visit | null>;

  // learning
  getTagWeights(userId: string, petId: string): Promise<TagWeights>;
  setTagWeights(
    userId: string,
    petId: string,
    weights: TagWeights,
  ): Promise<void>;
}
