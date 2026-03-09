const { z } = require('zod');
const ValidationError = require('../ValidationError');

/**
 * Schéma Zod pour la mise à jour d'un utilisateur
 * Tous les champs sont optionnels
 */
const updateUserSchema = z.object({
  username: z.string()
    .min(3, 'Nom d\'utilisateur invalide (minimum 3 caractères)')
    .max(50, 'Nom d\'utilisateur trop long (max 50 caractères)')
    .regex(/^\S+$/, 'Nom d\'utilisateur ne peut pas contenir d\'espaces')
    .optional(),
  email: z.string().email('Email invalide').trim().optional(),
  name: z.string()
    .max(100, 'Nom trop long (max 100 caractères)')
    .optional(),
  address: z.string()
    .max(200, 'Adresse trop longue (max 200 caractères)')
    .optional(),
  phone: z.string()
    .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Numéro de téléphone invalide')
    .optional()
}).refine((data) => {
  // Au moins un champ doit être fourni
  return Object.values(data).some(value => value !== undefined);
}, {
  message: 'Au moins un champ doit être fourni pour la mise à jour'
});

/**
 * DTO pour la mise à jour d'un utilisateur
 */
class UpdateUserDTO {
  constructor(data) {
    this.username = data?.username !== undefined ? data.username.trim() : undefined;
    this.email = data?.email !== undefined ? data.email.trim() : undefined;
    this.name = data?.name !== undefined ? data.name.trim() : undefined;
    this.address = data?.address !== undefined ? data.address.trim() : undefined;
    this.phone = data?.phone !== undefined ? data.phone.trim() : undefined;
  }

  /**
   * Valide les données d'entrée
   * @throws {ValidationError} Si les données ne sont pas valides
   */
  validate() {
    try {
      const dataToValidate = {};
      if (this.username !== undefined) dataToValidate.username = this.username;
      if (this.email !== undefined) dataToValidate.email = this.email;
      if (this.name !== undefined) dataToValidate.name = this.name;
      if (this.address !== undefined) dataToValidate.address = this.address;
      if (this.phone !== undefined) dataToValidate.phone = this.phone;

      const validatedData = updateUserSchema.parse(dataToValidate);

      // Met à jour les propriétés avec les données validées
      this.username = validatedData.username;
      this.email = validatedData.email;
      this.name = validatedData.name;
      this.address = validatedData.address;
      this.phone = validatedData.phone;

      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw ValidationError.fromZodError(error);
      }
      throw error;
    }
  }

  /**
   * Valide sans lancer d'erreur (retourne le résultat)
   */
  safeValidate() {
    const dataToValidate = {};
    if (this.username !== undefined) dataToValidate.username = this.username;
    if (this.email !== undefined) dataToValidate.email = this.email;
    if (this.name !== undefined) dataToValidate.name = this.name;
    if (this.address !== undefined) dataToValidate.address = this.address;
    if (this.phone !== undefined) dataToValidate.phone = this.phone;

    return updateUserSchema.safeParse(dataToValidate);
  }

  /**
   * Retourne les données validées (supprime les champs undefined)
   */
  toJSON() {
    const data = {};
    if (this.username !== undefined) data.username = this.username;
    if (this.email !== undefined) data.email = this.email;
    if (this.name !== undefined) data.name = this.name;
    if (this.address !== undefined) data.address = this.address;
    if (this.phone !== undefined) data.phone = this.phone;
    return data;
  }

  /**
   * Getter pour le schéma Zod
   */
  static get schema() {
    return updateUserSchema;
  }
}

module.exports = UpdateUserDTO;
