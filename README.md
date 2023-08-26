![ModNao logo](./public/logo.svg)

# ModNao

Naomi & SEGA Dreamcast ROM Model Viewer/Editor for games using the standard Sega Naomi Library 3D model format; Interactively explore and edit textures in a user friendly and accessible fashion on a ROM directly in your web browser.

Visit https://modnao.vercel.app to check it out... nao.

## Supported Titles and Formats

This list is subject to change as the NaomiLib model format is shared by many games. The main difference between different Dreamcast ROM model files that limit support is the binary packaging format as well as some unsupported forms of compression -- which for what is supported, is what this app is aimed to prevent you from worrying about!

| Title              | Supported File Types                                                                                                                    | Limitations/Known Issues                                                                                                                                                                                                                                                                               |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Marvel vs Capcom 2 | Models and Textures: Stages, Menu, Demo, Character Select, Character Assist & Lifebar Name Text (Viewing), Character Win Pose (Viewing) | A few demo model [`DM{NN}.BIN`] model textures use VQ image-compression on images which is not yet supported. These will appear as tiny garbled sections but can be safely edited/re-saved for non VQ areas. Portrait data [`PL{NN}_FAC.BIN`] only loads the first image as 2nd/3rd are VQ-compressed. |
| Capcom vs SNK 2    | Models and Textures: Stages and certain menu assets                                                                                     | Cannot export edited textures since there is a custom compression format and details to sort out with the algo to get files small enough to fit back into designated RAM.                                                                                                                              |
| Capcom vs SNK Pro  | Models: Stages                                                                                                                          | Not much to these, but cannot view associated textures since all are VQ formatted which is not yet supported.                                                                                                                                                                                          |

## Credits/Acknowledgements

While there are some liberties taken for the data structures used in this project, it probably would not have gotten anywhere without the people listed below for their help on researching/understanding
the NaomiLib model binary data formats:

<br/>
<a href="https://github.com/VincentNLOBJ" title="VincentNLObj"><img alt="VincentNLOBJ" src="https://avatars.githubusercontent.com/u/71412899?v=4" width="40"  style="height: auto; border-radius: 50%; border-width: 1px; border: solid; border-color: #ccc;"></a>
<a href="https://github.com/VincentNLOBJ" title="egregiousguy"><img src="https://avatars.githubusercontent.com/u/74125588?v=4" width="40"  style="height: auto; border-radius: 50%; border-width: 1px; border: solid; border-color: #ccc;"></a>
<a href="https://github.com/strugglemeat" title="(urboi)bankbank"><img src="https://avatars.githubusercontent.com/u/36766617?v=4" width="40"  style="height: auto; border-radius: 50%; border-width: 1px; border: solid; border-color: #ccc;"></a>
<a href="https://github.com/zocker-160" title="zocker-160"><img src="https://avatars.githubusercontent.com/u/36563538?v=4" width="40"  style="height: auto; border-radius: 50%; border-width: 1px; border: solid; border-color: #ccc;"></a>
<a href="https://github.com/TVIndustries" title="TVIndustries"><img src="https://avatars.githubusercontent.com/u/63134071?v=4" width="40"  style="height: auto; border-radius: 50%; border-width: 1px; border: solid; border-color: #ccc;"></a>
<a href="https://github.com/mountainmanjed" title="Jed Hudson"><img src="https://avatars.githubusercontent.com/u/5819256?v=4" width="40"  style="height: auto; border-radius: 50%; border-width: 1px; border: solid; border-color: #ccc;"></a>
