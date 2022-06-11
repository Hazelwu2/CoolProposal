import Swal from 'sweetalert2'

export const handleError = ({ reason = '', message = '' }) => {
  Swal.fire({
    icon: 'error',
    title: '發生錯誤',
    text: `${reason || message}`,
  })
}


export const checkNetwork = ({ name }) => {
  if (name !== 'Rinkeby') {
    console.error('[⚠錯誤網路，請切換至 Rinkby]')
    handleError({ reason: '⚠錯誤網路，請切換至 Rinkby' })
    return false
  }
  return true
}