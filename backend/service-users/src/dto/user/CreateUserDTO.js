const { z } = require('zod');
const ValidationError = require('../ValidationError');

/**
 * Schéma Zod pour la création d'un utilisateur (Admin)
 */
const createUserSchema = z.object({
  username: z.string()
    .min(3, 'Nom d\'utilisateur invalide (minimum 3 caractères)')
    .max(50, 'Nom d\'utilisateur trop long (max 50 caractères)')
    .regex(/^\S+$/, 'Nom d\'utilisateur ne peut pas contenir d\'espaces')
    .trim(),
  email: z.string().email('Email invalide').trim().min(1, 'Email est requis'),
  password: z.string()
    .min(6, 'Mot de passe invalide (minimum 6 caractères)')
    .max(100, 'Mot de passe trop long (max 100 caractères)'),
  name: z.string()
    .max(100, 'Nom trop long (max 100 caractères)')
    .optional(),
  address: z.string()
    .max(200, 'Adresse trop longue (max 200 caractères)')
    .optional(),
  phone: z.string()
    .optional()
    .refine((val) => val === '' || /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(val), 'Numéro de téléphone invalide'),

});

/**
 * DTO pour la création d'un utilisateur (Admin)
 */
class CreateUserDTO {
  constructor(data) {
    this.username = data?.username?.trim() || '';
    this.email = data?.email?.trim() || '';
    this.password = data?.password || '';
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
      const validatedData = createUserSchema.parse({
        username: this.username,
        email: this.email,
        password: this.password,
        ...(this.name !== undefined && { name: this.name }),
        ...(this.address !== undefined && { address: this.address }),
        ...(this.phone !== undefined && { phone: this.phone })
      });

      // Met à jour les propriétés avec les données validées
      this.username = validatedData.username;
      this.email = validatedData.email;
      this.password = validatedData.password;
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
    const dataToValidate = {
      username: this.username,
      email: this.email,
      password: this.password
    };
    if (this.name !== undefined) dataToValidate.name = this.name;
    if (this.address !== undefined) dataToValidate.address = this.address;
    if (this.phone !== undefined) dataToValidate.phone = this.phone;

    return createUserSchema.safeParse(dataToValidate);
  }

  /**
   * Retourne les données validées
   */
  toJSON() {
    const data = {
      username: this.username,
      email: this.email,
      password: this.password
    };
    if (this.name !== undefined) data.name = this.name;
    if (this.address !== undefined) data.address = this.address;
    if (this.phone !== undefined) data.phone = this.phone;
    return data;
  }

  /**
   * Getter pour le schéma Zod
   */
  static get schema() {
    return createUserSchema;
  }
}

module.exports = CreateUserDTO;
