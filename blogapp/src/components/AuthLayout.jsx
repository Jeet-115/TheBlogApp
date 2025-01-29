import React, {useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'

export default function Protected({children, authentication = true}) {

    const navigate = useNavigate()
    const [loader, setLoader] = useState(true)
    const authStatus = useSelector(state => state.auth.status)

    useEffect(() => {
        const checkAuth = async () => {
            const session = await authService.getCurrentUser();
            if (!session && authentication) {
                navigate("/login");
            }
            setLoader(false);
        };
    
        checkAuth();
    }, [authentication, navigate]);
    

  return loader ? <h1>Loading...</h1> : <>{children}</>
}

