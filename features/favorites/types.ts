/** Doc §5, UsersModule: "Profile CRUD, addresses, favorites." No dedicated schema table is shown for this one — modeled as a simple user↔vendor join, same shape a real `favorites` table would need. */
export interface Favorite {
  id: string;
  userId: string;
  vendorId: string;
  createdAt: string;
}
