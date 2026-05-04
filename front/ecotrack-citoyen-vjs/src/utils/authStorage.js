// utils/authStorage.js

export function getToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token')
}

export function getUserId() {
  return localStorage.getItem('userId') || sessionStorage.getItem('userId')
}

// Obtenir les roles stockés dans le Navigateur
export function getRoles() {
  const roles =
    localStorage.getItem('roles') || sessionStorage.getItem('roles')
  return roles ? JSON.parse(roles) : []
}
