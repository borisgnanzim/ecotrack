// Pour les roles
import authStorage from '../authentication/authStorage.js'

export default {
  // admin
  async isAdmin() {
    const roles = await authStorage.getDBRoles()
    return roles.includes('admin')
  },

  // agent
  async isAgent() {
    const roles = await authStorage.getDBRoles()
    return roles.includes('agent')
  },

  // manager
  async isManager() {
    const roles = await authStorage.getDBRoles()
    return roles.includes('manager')
  }
}
