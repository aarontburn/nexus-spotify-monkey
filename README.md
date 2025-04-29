# [Nexus](https://github.com/aarontburn/nexus-core): Spotify Monkey

  <img src="./src/assets/icon.png" alt="Discord Monkey Icon" width="200"/>

A module for [Nexus](https://github.com/aarontburn/nexus-core) to "embed" Spotify as a Nexus module...

And by "embed", this just takes your Spotify window and monkeys it around.



<p align="center">
  <img src="./assets/sample-image.png" alt="Spotify Monkey Sample" width="1000"/>

</p>

## Required Dependencies
### Module Dependencies
You will need the following modules installed into Nexus.
- [**Monkey Core**](https://github.com/aarontburn/nexus-monkey-core)

### Application Dependencies
The following applications need to be installed to your computer.
- [**Spotify**](https://open.spotify.com/download)
  - Download using the Spotify Installer executable; Spotify from the Microsoft Store will prevent you from accessing its executable path which prevents Spotify Monkey from creating new instances of it.

## Installation
1. Download and install all dependencies.
2. Download the latest release `.zip`. 
3. In Nexus, navigate to **Settings** > **Import Module**
4. Select the downloaded `.zip` file to install.


## Usage
- On startup (or when the `Locate window` button is pressed), Spotify Monkey will look for your open Spotify window, and, if found within 10 seconds, will start monkeying the window into Nexus.
- By providing a path to your Spotify executable in the Settings, you unlock the following features:
  -  Opening the Spotify app while it's already embedded into Nexus will swap to the Spotify Monkey module.
  -  The `Locate window` button will start a new instance of Spotify if one isn't found.



## Limitations:
- Some features won't work with Spotify downloaded from the Microsoft Store.
