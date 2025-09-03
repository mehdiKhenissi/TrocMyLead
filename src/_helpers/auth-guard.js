import router from '@/router'
import { accountService, userService } from '@/_services'

export async function authGuard(){
    if(accountService.isLogged()){
        await userService.getUser(accountService.getToken(), JSON.parse(accountService.getSessionUser()).id) // check the user in database
        .then(async (response) => {
            //console.log(response)
            if(typeof response.data != "undefined"){
                //alert("ok");
                return true
            }
            else{
                accountService.clearSessionUser()
                router.push('/connection')
            }
        })
        .catch(async (error) => {
            accountService.clearSessionUser()
            router.push('/connection')
        })
        //return true
    }
    else{
        // remove all user informations saved in session
        accountService.clearSessionUser()
        router.push('/connection')
    }
    
}