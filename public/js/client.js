const deleteProduct = btn => {
    const productId = btn.parentNode.querySelector('[name=productId]').value
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value

    const element = btn.parentNode.parentNode
    
    fetch('/profile/'+productId, {
        method : 'DELETE',
        headers : {
            'csrf-token' : csrf
        }
    }).then(result => {
        element.parentNode.removeChild(element)
    })
}