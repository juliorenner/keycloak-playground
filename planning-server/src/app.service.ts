import { Injectable } from '@nestjs/common';
import axios, { AxiosError, AxiosResponse } from 'axios';

const clientId = 'planning-service';
const clientSecret = process.env.KC_CLIENT_SECRET;
const keycloakUrl = 'http://keycloak:8080';

@Injectable()
export class AppService {
  async getHello(): Promise<string> {
    console.log('retrieving accessToken')
    const accessToken = await this.getAccessToken();
    console.log('accessToken retrieved')

    console.log('calling notification server')
    return this.callNotificationServer(accessToken);
  }

  private async getAccessToken(): Promise<string> {
    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('grant_type', 'client_credentials');

    let response;
    try {
      response = await axios.post(
        `${keycloakUrl}/realms/myrealm/protocol/openid-connect/token`,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
    } catch (e) {
      this.handleAxiosError(e);
      throw e;
    }

    console.log('access token: ' + response.data.access_token);

    return response.data.access_token;
  }

  private async callNotificationServer(accessToken: string): Promise<string> {
    let response: AxiosResponse<any, any>;

    try {
      response = await axios.get('http://notification-server:3001/', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (e) {
      this.handleAxiosError(e);
      throw e;
    }

    return response.data;
  }

  private handleAxiosError (error: AxiosError) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
      console.error('Error headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    console.error('Error config:', error.config);
  };
}
