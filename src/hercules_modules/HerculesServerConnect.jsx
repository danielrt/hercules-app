import { getHerculesAddress, getPassword, getUser, setLogin } from "../helpers/Utils";
import axios from 'axios';

export async function loginHercules(login, password) {
    var herculesLoginApiPoint = await getHerculesAddress();
    console.log(herculesLoginApiPoint);
    if(herculesLoginApiPoint) {
        herculesLoginApiPoint = herculesLoginApiPoint.concat("/login");
    }
    else {
        return false;
    }

    console.log("loginHercules = %s %s %s", login, password, herculesLoginApiPoint);

    try {
        var response = await axios(
            {
                method: 'post',
                timeout : 5000,
                url: herculesLoginApiPoint,
                auth: {
                    username: login,
                    password: password
                }
            }
        );
    
        console.log(response);
    
        if(response.data["success"] === 1) {
            setLogin(login, password);
            return true;
        }
    }
    catch(e) {
        console.log(e);
    }
    return false;

}

export async function sendHerculesCommand(command) {
    var herculesExecuteCommandApiPoint = await getHerculesAddress();
    console.log(herculesExecuteCommandApiPoint);
    if(herculesExecuteCommandApiPoint) {
        herculesExecuteCommandApiPoint = herculesExecuteCommandApiPoint.concat("/executeCommand");
    }
    else {
        return false;
    }

    var userName = await getUser();
    var userPassword = await getPassword();

    console.log("sendHerculesCommand = %s %s %s %s", userName, userPassword, command, herculesExecuteCommandApiPoint);
    
    try {
        var response = await axios(
            {
                method: 'get',
                timeout : 5000,
                url: herculesExecuteCommandApiPoint,
                auth: {
                    username: userName,
                    password: userPassword
                },
                params: {
                    command: command
                }
            }
        )
    
        console.log(response);
    
        if(response.data["success"] === 1) {
            return true;
        }
    }
    catch(e) {
        console.log(e);
    }

    return false;
}

export async function pingHercules() {
    var herculesPingApiPoint = await getHerculesAddress();
    console.log(herculesPingApiPoint);
    if(herculesPingApiPoint) {
        herculesPingApiPoint = herculesPingApiPoint.concat("/ping");
    }
    else {
        return false;
    }

    console.log("pingHercules = %s", herculesPingApiPoint);

    try {
        var response = await axios(
            {
                method: 'get',
                timeout : 5000,
                url: herculesPingApiPoint,
            }
        )
    
        console.log(response);
    
        if(response.data["success"] === 1) {
            return true;
        }
    }
    catch(e) {
        console.log(e);
    }
    return false;

}