from bs4 import BeautifulSoup
from geopy.geocoders import Nominatim
from time import sleep
# from pygeocoder import Geocoder
from urllib.request import urlopen

class LeagueData:
    def __init__(self, name, city, country, icon, wftda_page):
        self.name = name
        self.city = city
        self.country = country
        self.icon = icon
        self.wftda_page = wftda_page
        
    def p(self):
        lat = self.coords.latitude if self.coords is not None else '""'
        lng = self.coords.longitude if self.coords is not None else '""'
        return f"""{{
    "name": "{self.name}",
    "country": "{self.country}",
    "city": "{self.city}",
    "logo": "{self.icon}",
    "loc": {{
        "lat": {lat},
        "lng": {lng}
    }},
    
    "leagues": ["WFTDA"],
    "wftdaWebsite": "{self.wftda_page}"
}},"""

def main():
    leagues = []
    geolocator = Nominatim(user_agent="derby_phonebook")
    # gc = Geocoder(api_key='AIzaSyCq8tHnfFaqbUrIFP51bmTK2QRi-iPW7x0')
    
    with open('./python-scrape/WFTDA Leagues - WFTDA.html', 'r', encoding="utf-8") as file:
        with open('./python-scrape/out.json', 'w') as outFile:
            print('[\n', file=outFile)
            
            html_doc = file.read()
            soup = BeautifulSoup(html_doc, 'html.parser')
            # print(soup.prettify())
            
            leagueDivList = soup.find_all('div', class_='leagues-item')
            print('Found data for ' + str(len(leagueDivList)) + ' leagues')
            
            for leagueDiv in leagueDivList:
                # Scrape basic data
                name = leagueDiv.find('span', class_='league_name').get_text()
                city = leagueDiv.find('div', class_='league-location').get_text().strip()
                country = leagueDiv.find('span', class_='league_country').get_text().strip()
                full_source = leagueDiv.a.noscript.img['src'].split('/')
                source = '/img/leagues/WFTDA/' + full_source[len(full_source) - 1]
                wftda_page = leagueDiv.a['href']
                
                # Look up url
                # with urlopen(wftda_page) as webpage:
                #     html_string = webpage.read().decode()
                #     print(html_string)
                
                # Look up city coordinates
                coords = attempt_geocode(city, geolocator)
                if coords:
                    print(f'{name} in {city} has coords {coords.latitude}, {coords.longitude}')
                # results = gc.geocode(city)
                # print(f'{name} in {city} has coords {results[0].coordinates}')
                ld = LeagueData(name, city, country, source, wftda_page)
                ld.coords = coords
                leagues.append(ld)
                # sleep(1.5)
                
                print(ld.p(), file=outFile)
            print('\n]', file=outFile)
            sleep(1)
        
            
def fixTypos(city):
    if city == 'Atlanta, GA, us':
        return 'Atlanta'
    if city == 'Columbia/Jefferson City, MO, us':
        return 'Columbia MO USA'
    if city == 'Las Vegas, NV, us':
        return 'Las Vegas'
    if city == 'Utica/Rome, NY, us':
        return 'Rome NY'
    if city == 'Baja, mx':
        return 'Baja California Mexico'
    if city == 'Bogotà, co':
        return 'Bogota Columbia'
    return city

def attempt_geocode(address, geolocator, attempt=1, max_attempts=10):
    try:
        return geolocator.geocode(fixTypos(address).replace(',', ''))
    except:
        if attempt <= max_attempts:
            print(f'Retrying geolocation for {address}')
            sleep(attempt + 0.5)
            return attempt_geocode(address, geolocator, attempt+1)
        else:
            raise f'Maximum attempts exceeded for geolocating {address}'
        
        
if __name__ == '__main__':
    main()