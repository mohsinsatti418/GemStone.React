import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

export async function loginRequest(username, password) {
  try {
    const res = await api.post('/auth/login', {
      username,
      password,
    })

    // Returns:
    // { token: "eyJ..." }
    return res.data
  } catch (err) {
    // Backend custom message
    throw new Error(
      err.response?.data?.message ||
      'Invalid username or password'
    )
  }
}