import { IonContent, 
    IonInput, 
    IonButton, 
    IonPage, 
    IonAlert, 
    IonGrid, 
    IonRow, 
    IonCol, 
    useIonLoading, } from '@ionic/react';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { getHerculesAddress, setHerculesAddress } from '../helpers/Utils'
import { loginHercules, pingHercules } from '../hercules_modules/HerculesServerConnect';
import { ZeroConf } from 'capacitor-zeroconf';
import './Login.css'

function Login({onLogin}) {

    const [userName, setUserName] = useState("");
    const [userPassword, setUserPassword] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    const [openAlert, setOpenAlert] = useState(false);
    const [showSearchHerculesButton, setShowSearchHerculesButton] = useState(false);
    const [present, dismiss] = useIonLoading();

    var isSearching = false; 

    async function searchForHercules() {
        console.log("Buscando o Hércules");
        present({
            message : "Buscando o Hércules"
        });

        var isConn = false;
        var herculesAddress = await getHerculesAddress();
        if(herculesAddress && herculesAddress !== "") {
            isConn = await pingHercules();
        }

        if(!isConn) {
            await setHerculesAddress("");
            isSearching = true;
            ZeroConf.watch({type : '_hercules-http._tcp.', domain : 'local.'}, async function(result) {
                if(result) {
                    console.log('Serviço encontrado:', result);
                    var action = result.action;
                    var service = result.service;
                    if (action == 'added') {
                        console.log('service added', service);
                    } else if (action == 'resolved') {
                        console.log('service resolved', service);
                        isSearching = false;
                        dismiss().then(() => {
                            setAlertMessage("Hércules encontrado com sucesso!");
                            setOpenAlert(true);
                            setShowSearchHerculesButton(false);
                        });
                        var ip; // Endereço IP do servidor
                        if(service.ipv4Addresses[0]) {
                            ip = service.ipv4Addresses[0]; 
                        }
                        else {
                            ip = "[".concat(service.ipv6Addresses[0], "]");
                        }
                        const port = service.port;         // Porta do serviço
                    
                        console.log(`Servidor Hercules disponível em: http://${ip}:${port}`);
                        var herculesAddress = "http://".concat(ip, ":", port);
                        await setHerculesAddress(herculesAddress);
                        await ZeroConf.close();
                        

                    } else {
                        console.log('service removed', service);
                    }
                }
    
            });
    
            // Definir um temporizador para parar a busca após o tempo limite
            setTimeout(() => {
                if(isSearching) {
                    console.log('Tempo limite atingido. Parando a busca.');
                    isSearching = false;
                    dismiss().then(() => {
                        setAlertMessage("Infelizmente não foi possível encontrar o Hércules!\n \
                            Se certifique que o seu celular está conectado na mesma rede do Hércules.");
                        setOpenAlert(true);
                        setShowSearchHerculesButton(true);
                    });
                    ZeroConf.close(); // Interrompe o processo de descoberta de serviços
                }
            }, 20000);
        }
        else {
            dismiss();
        }
    }

    useEffect(() => {
        searchForHercules();
    }, []);
    
    const history = useHistory();

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("handleSubmit = %s %s", userName, userPassword);
        var isLogged = await loginHercules(userName, userPassword);
        if(isLogged) {
            onLogin(true);
            history.push('/');
            //setAlertMessage("Login suceso!");
            //setOpenAlert(true);
        }
        else {
            setAlertMessage("Login ou senha incorretos!");
            setOpenAlert(true);
        }
    };

    return (
        <IonPage>
            <form onSubmit={handleSubmit}>
                <IonContent fullscreen color="light" >
                    <IonGrid className="vertical-center">
                        <IonRow class="ion-justify-content-center">
                            <IonCol size='6' class="ion-justify-content-center">
                                <h2>HÉRCULES</h2>
                            </IonCol>
                        </IonRow>
                        <IonRow class="ion-justify-content-center">
                            <IonCol size='6'>
                                <IonInput
                                    required
                                    label="Login" labelPlacement="floating" fill="outline"
                                    placeholder="Insira o login"
                                    value={userName}
                                    onIonInput={(e) => setUserName(e.target.value)}
                                />
                            </IonCol>
                        </IonRow>
                        <IonRow class="ion-justify-content-center">
                            <IonCol size='6'>
                                <IonInput
                                    required
                                    label="Senha" labelPlacement="floating" fill="outline"
                                    type="password" 
                                    placeholder="Insira a senha"
                                    value={userPassword}
                                    onIonInput={(e) => setUserPassword(e.target.value)}
                                />
                            </IonCol>
                        </IonRow>

                        <IonRow class="ion-justify-content-center">
                            <IonCol size='4'>
                                <IonButton  size="default" type="submit">Logar</IonButton>
                            </IonCol>
                        </IonRow>

                        { showSearchHerculesButton && (
                            <IonRow class="ion-justify-content-center">
                                <IonCol size='4'>
                                    <IonButton  size="default" onClick={() => { searchForHercules(); }}>Procurar Hércules</IonButton>
                                </IonCol>
                            </IonRow>
                            )
                        }
  
                    </IonGrid>
                    <IonAlert
                        isOpen={openAlert}
                        header="Hércules"
                        message={alertMessage} 
                        buttons={['Ok']}
                        onDidDismiss={() => setOpenAlert(false)}
                    >
                    </IonAlert>
                </IonContent>
            </form>
        </IonPage>
    );
};

export default Login;
