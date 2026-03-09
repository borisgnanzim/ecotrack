const { z } = require('zod');
const ValidationError = require('../ValidationError');

/**
 * Schéma Zod pour la création d'une notification
 */
const createNotificationSchema = z.object({
  userId: z.union([z.string(), z.number()]).optional(),
  title: z.string()
    .min(1, 'Titre requis')
    .max(200, 'Titre trop long (max 200 caractères)')
    .trim(),
  message: z.string()
    .min(1, 'Message requis')
    .max(1000, 'Message trop long (max 1000 caractères)')
    .trim(),
  type: z.enum(['info', 'warning', 'error', 'success'], {
    errorMap: () => ({ message: 'Type invalide (doit être: info, warning, error, success)' })
  }).default('info'),
  isRead: z.boolean().default(false)
});

/**
 * DTO pour la création d'une notification
 */
class CreateNotificationDTO {
  constructor(data) {
    this.userId = data?.userId || undefined;
    this.title = data?.title ? data.title.trim() : '';
    this.message = data?.message ? data.message.trim() : '';
    this.type = data?.type?.trim() || 'info';
    this.isRead = data?.isRead || false;
  }

  /**
   * Valide les données d'entrée
   * @throws {ValidationError} Si les données ne sont pas valides
   */
  validate() {
    try {
      const validatedData = createNotificationSchema.parse({
        ...(this.userId !== undefined && { userId: this.userId }),
        title: this.title,
        message: this.message,
        type: this.type,
        isRead: this.isRead
      });

      // Met à jour les propriétés avec les données validées
      this.userId = validatedData.userId;
      this.title = validatedData.title;
      this.message = validatedData.message;
      this.type = validatedData.type;
      this.isRead = validatedData.isRead;

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
      title: this.title,
      message: this.message,
      type: this.type,
      isRead: this.isRead
    };
    if (this.userId !== undefined) dataToValidate.userId = this.userId;

    return createNotificationSchema.safeParse(dataToValidate);
  }

  /**
   * Retourne les données validées
   */
  toJSON() {
    const data = {
      title: this.title,
      message: this.message,
      type: this.type,
      isRead: this.isRead
    };
    if (this.userId !== undefined) data.userId = this.userId;
    return data;
  }

  /**
   * Getter pour le schéma Zod
   */
  static get schema() {
    return createNotificationSchema;
  }
}

module.exports = CreateNotificationDTO;
