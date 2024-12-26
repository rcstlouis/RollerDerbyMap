export class ContactUsConfig {
  firstName: string
  lastName: string
  subject: string
  body: string
  email: string

  constructor(obj: ContactUsConfig) {
    this.firstName = obj.firstName
    this.lastName = obj.lastName
    this.subject = obj.subject
    this.body = obj.body
    this.email = obj.email
  }
}
