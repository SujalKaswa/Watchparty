# ReelRoom movie catalog: source notes

## Curation and playback policy

The seeded collection contains exactly 30 films, split evenly between Hollywood and Bollywood (15 each). It is an editorial starter selection, not a ranked “top films” list; no ratings or commercial rankings are invented. Release years, catalog runtimes, genre facets, synopses, and source classifications below come from the cited research records. Mood labels are editorial.

A catalog entry is not automatically watchable. In-room playback is preloaded only for a supported YouTube URL or a direct HTTPS MP4/WebM/Ogg URL with official-source or jurisdiction-specific public-domain evidence. Official YouTube availability, embed permission, autoplay/user-gesture requirements, and geographic access can vary. The player reports YouTube embed failures and lets the host add another supported URL. Public-domain labels below are limited to the cited jurisdiction; they do not establish worldwide rights.

Embedding statuses below record the checked page/player result at research time; `not-verifiable` means no positive embed result was established, and `verified` is not a guarantee of future or worldwide playback. Direct-media endpoints listed as in-room URLs were checked for HTTP 206 byte-range responses with a video media type; that transport check does not confirm full browser playback.

The 22 added poster images are locally stored, proportion-preserving WebP derivatives of accurate poster images returned by image search. Poster copyright and redistribution rights were not independently cleared. The image-reference URLs are recorded per title for attribution/traceability; replace with licensed or commissioned artwork before commercial redistribution if required. The existing eight posters remain local JPEG assets.

The idempotent seed inserts missing records and preserves existing catalog fields. For pre-existing records, it backfills playback URL, source classification, evidence URL, and rights note only when all four existing fields are empty; if any is populated, it preserves the existing source set.

## Hollywood

### The Shawshank Redemption (1994)

- Runtime: 142 minutes; industry: Hollywood; primary genre: Drama; genres: Drama, Crime.
- Synopsis: Wrongly convicted banker Andy Dufresne forms a lasting friendship with fellow inmate Red while enduring life inside Shawshank prison; their bond sustains hope amid the brutality and monotony of prison life.
- Poster asset: `client/public/posters/shawshank-redemption.jpg`; reference: [film poster reference](https://www.imdb.com/title/tt0111161/).
- Metadata sources: [1](https://www.warnerbros.com/movies/shawshank-redemption); [2](https://www.bfi.org.uk/film/27458270-29df-5059-803c-b4e4bef9912b/the-shawshank-redemption); [3](https://www.rottentomatoes.com/m/shawshank_redemption).
- In-room media URL: none verified. The host can add a supported YouTube or direct HTTPS media URL, but this catalog record is not itself represented as playable.
- Verification notes: Warner Bros.' official film page verifies the 1994 release, Crime/Drama genres, synopsis, and links to digital retailers; it does not provide public full-film playback. BFI independently verifies 1994 and a 142-minute runtime. The official Warner Bros. YouTube result inspected is explicitly an official trailer, not the feature. The YouTube Movies listing for a 2:22:30 full-length title identifies Warner Bros. as provider but displayed “Video unavailable” and “Not available,” so it is not a publicly playable source here. The separately supplied URL resolves to Mrwhosetheboss's 2025 technology video, not this film. No qualifying public full-film source was established; embedding could not be verified for an eligible playback source.

### The Godfather (1972)

- Runtime: 175 minutes; industry: Hollywood; primary genre: Crime; genres: Crime, Drama.
- Synopsis: The aging patriarch of a powerful Italian-American crime family weighs succession as his youngest son, initially reluctant to join the family business, is drawn into its dangerous world.
- Poster asset: `client/public/posters/the-godfather.jpg`; reference: [film poster reference](https://www.imdb.com/title/tt0068646/).
- Metadata sources: [1](https://silver.afi.com/movies/detail/0100001483); [2](https://www.rottentomatoes.com/m/the_godfather); [3](https://www.paramountplus.com/movies/video/d1xdkOt5uh339gZVfKlF_o6Y65b_yAeD/).
- In-room media URL: none added. The researched source page [https://pluto.tv/us/movies/6137ee7dc79f030013e056d0/](https://pluto.tv/us/movies/6137ee7dc79f030013e056d0/) is not a supported direct-media/YouTube URL, or did not meet the source evidence requirement; it is not presented as watchable in ReelRoom.
- Research rights/source note: The US Pluto TV film page labels The Godfather ‘Watch Free,’ offers ‘Play Now,’ and lists the 1972, 2h 57m title. Pluto TV's official corporate brand page describes Pluto TV as part of Paramount. This supports an official US streaming-platform listing, not public-domain status; availability outside the US is not established.
- Verification notes: AFI Silver identifies the film as a 1972 crime drama and gives 175 minutes; Paramount+'s official listing also gives 2h 55m. Rotten Tomatoes reports 2h 57m, a runtime discrepancy; 175 minutes is used based on AFI and Paramount+. Pluto TV's official US page lists the film as free on demand with a Play Now link and a 2h 57m runtime. The supplied YouTube URL resolves to Mrwhosetheboss's unrelated video ‘I bought the LAZIEST Tech ever.’, so it is not attributed to this film. Pluto playback was not interactively tested, and embedding was not confirmed.

### The Dark Knight (2008)

- Runtime: 152 minutes; industry: Hollywood; primary genre: Action; genres: Action, Crime, Drama, Superhero.
- Synopsis: As the Joker unleashes a campaign of chaos in Gotham, Batman joins forces with Lieutenant Jim Gordon and District Attorney Harvey Dent to protect the city and its people.
- Poster asset: `client/public/posters/the-dark-knight.jpg`; reference: [film poster reference](https://www.imdb.com/title/tt0468569/).
- Metadata sources: [1](https://www.warnerbros.com/movies/dark-knight); [2](https://www.bfi.org.uk/film/c696829d-9680-5529-a70e-1140da039234/the-dark-knight); [3](https://www.hbomax.com/movie/52217243-a137-45d6-9c6a-0dfab4633034).
- In-room media URL: none verified. The host can add a supported YouTube or direct HTTPS media URL, but this catalog record is not itself represented as playable.
- Verification notes: Warner Bros. lists the 18 July 2008 theatrical release and genres; BFI confirms the 2008 date and 152-minute runtime. The official HBO Max listing offers the film only through subscription plans, so it is not a qualifying public full-film source under the stated policy. The supplied YouTube URL resolves to Mrwhosetheboss’s 21:07 technology video, not this film; it is not attributed to the title. No qualifying publicly playable full-film source or public-domain evidence was established. Genre facets are normalized from official/catalog descriptions; no claim of availability or embedding is made.

### Interstellar (2014)

- Runtime: 169 minutes; industry: Hollywood; primary genre: Science Fiction; genres: Science Fiction, Drama, Adventure.
- Synopsis: As environmental collapse threatens humanity’s future on Earth, former pilot Cooper leaves his family to lead an expedition beyond the galaxy in search of a possible new home.
- Poster asset: `client/public/posters/interstellar.jpg`; reference: [film poster reference](https://www.imdb.com/title/tt0816692/).
- Metadata sources: [1](https://www.paramountplus.com/movies/video/pogPZ4svoLUp1fNjrr4osk0HOjN3r2b9/); [2](https://www.legendary.com/film/interstellar/); [3](https://www.imdb.com/title/tt0816692/).
- In-room media URL: none verified. The host can add a supported YouTube or direct HTTPS media URL, but this catalog record is not itself represented as playable.
- Verification notes: Paramount+’s official listing identifies Interstellar as a 2014, 2h 49m film and offers it to stream only after signing up; this is a paywalled listing, not a qualifying publicly playable source. Legendary’s official film page confirms the 2014 release and Drama/Science Fiction genres. IMDb independently shows 2014, 2h 49m, and corroborating genre/synopsis information. No complete public full-film video from an official, freely accessible source or evidence of public-domain status in a stated jurisdiction was verified. The separately supplied YouTube URL was not established as this film and is not attributed to it. Embedding was not confirmed.

### The General (1926)

- Runtime: 79 minutes; industry: Hollywood; primary genre: Comedy; genres: Comedy, Action, Adventure.
- Synopsis: During the Civil War, Confederate locomotive engineer Johnnie Gray pursues Union raiders who have stolen his beloved train, with his fiancée aboard, and tries to rescue them both.
- Poster asset: `client/public/posters/the-general.webp`; reference: [IMDb image-search result](https://files.manuscdn.com/search-media/310519664020691393/UXq8UgPtQ2Nkr5hYqbKk0C/cYxiMrpBi2UpiPdYMNBQQL.jpg).
- Metadata sources: [1](https://cohenmedia.net/product/the-general); [2](https://www.bfi.org.uk/film/136a6211-90d9-5d18-b047-7967deac8bab/the-general); [3](https://www.themoviedb.org/movie/961-the-general?language=en-US).
- In-room media URL: [public-domain](https://archive.org/download/TheGeneral1926/The_General_1926_720p_512kb.mp4) (supported direct-media or YouTube URL).
- Playback/source evidence: [https://publicdomainreview.org/collection/the-general-1926/](https://publicdomainreview.org/collection/the-general-1926/).
- Rights note: Public Domain Review identifies the underlying film as public domain in the United States; rights to this particular digitized copy are unclear. This is not a worldwide rights conclusion.
- Research embed status: `verified` (at the time checked).
- Verification notes: Opened the Internet Archive item page: it identifies The General, lists a full runtime of 1:18:52 and downloadable full-length video, and provides an embed iframe. Cohen Media lists a 79-minute runtime; TMDB also lists 1h 19m. BFI lists 90 minutes, which appears to reflect a different presentation/version; runtime is reported as 79 minutes in line with the distributor listing and corroborating record. The exact user-supplied YouTube URL was not attributed to this title.

### Sherlock Jr. (1924)

- Runtime: 45 minutes; industry: Hollywood; primary genre: Comedy; genres: Comedy, Mystery, Romance, Fantasy.
- Synopsis: A small-town movie-theater projectionist dreams of becoming a detective. When a romantic rival frames him for theft, he falls asleep in the projection booth and imagines himself inside the film as the master sleuth Sherlock Jr.
- Poster asset: `client/public/posters/sherlock-jr.webp`; reference: [IMDb image-search result](https://files.manuscdn.com/search-media/310519664020691393/UXq8UgPtQ2Nkr5hYqbKk0C/drwxjwBNpbrHnmRZZqkMxQ.jpg).
- Metadata sources: [1](https://catalog.afi.com/Film/12044-SHERLOCK-JR); [2](https://www.bfi.org.uk/film/4f7add12-c2af-5c5c-bb49-1647ce3240df/sherlock-jr); [3](https://www.tcm.com/articles/silent/92535/sherlock-jr-1924).
- In-room media URL: [public-domain](https://archive.org/download/sherlock-jr.-1924/Sherlock%20Jr.1924.mp4) (supported direct-media or YouTube URL).
- Playback/source evidence: [https://www.silentera.com/PSFL/data/S/SherlockJunior1924.html](https://www.silentera.com/PSFL/data/S/SherlockJunior1924.html).
- Rights note: Silent Era identifies the film as public domain in the USA. This does not establish rights in other jurisdictions or in the version’s added soundtrack; the Internet Archive uploader is unknown.
- Research embed status: `not-verifiable`; no positive embed conclusion is drawn.
- Verification notes: Opened the AFI, BFI, TCM, Silent Era, and Internet Archive pages. The Archive item has an in-browser player and an MP4 download; a byte-range request to the MP4 resolved successfully as video/mp4, and the item metadata reports 2,684.72 seconds (44:45), consistent with the complete short feature. The upload is by an unknown uploader, and embed playback was not independently tested, so embedding is not verifiable. Runtime sources differ: BFI lists 45 minutes, TCM describes about 44 minutes, and AFI lists 48; 45 minutes is used here as the closest listed duration to the verified Archive video. The Archive version's soundtrack rights were not established.

### Night of the Living Dead (1968)

- Runtime: 96 minutes; industry: Hollywood; primary genre: Horror; genres: Horror, Zombie, Thriller.
- Synopsis: After an attack at a cemetery, a young woman and a resourceful stranger take refuge in a rural farmhouse as reanimated dead surround it; growing tensions among the survivors complicate their effort to endure the night.
- Poster asset: `client/public/posters/night-of-the-living-dead.webp`; reference: [IMDb image-search result](https://files.manuscdn.com/search-media/310519664020691393/UXq8UgPtQ2Nkr5hYqbKk0C/ckVFby9iB9hm8tjYcBW5JV.jpg).
- Metadata sources: [1](https://www.criterion.com/films/29331-night-of-the-living-dead); [2](https://www.rottentomatoes.com/m/night_of_the_living_dead); [3](https://catalog.afi.com/Catalog/moviedetails/19843).
- In-room media URL: [public-domain](https://archive.org/download/night-of-the-living-dead-1968-english/Night%20of%20the%20Living%20Dead%20%281968%29%20English.mp4) (supported direct-media or YouTube URL).
- Playback/source evidence: [https://www.yorku.ca/osgoode/iposgoode/2021/09/30/public-domain-of-the-living-dead/](https://www.yorku.ca/osgoode/iposgoode/2021/09/30/public-domain-of-the-living-dead/).
- Rights note: Osgoode Hall Law School’s IPilogue explains the U.S. public-domain basis (omitted notice on 1968 U.S. theatrical prints). This is U.S.-limited; other jurisdictions are not assessed.
- Research embed status: `verified` (at the time checked).
- Verification notes: Opened the Internet Archive item: it identifies the title as a full film, provides an embedded-player iframe, and labels the upload Public Domain Mark 1.0. The linked H.264 file resolves as video/mp4 and its listed duration is 5,752.79 seconds (about 96 minutes). The Archive uploader is a third party, not a rights holder; the U.S. public-domain basis is supported separately by the cited Osgoode Hall Law School IPilogue. Runtime sources differ: Criterion and Rotten Tomatoes give 96 minutes; AFI Catalog lists 90 minutes. Used 96 minutes, consistent with the full-file duration and two metadata references.

### His Girl Friday (1940)

- Runtime: 92 minutes; industry: Hollywood; primary genre: Screwball Comedy; genres: Screwball Comedy, Comedy, Romantic Comedy.
- Synopsis: When reporter Hildy Johnson tells her fast-talking newspaper-editor ex-husband, Walter Burns, that she plans to leave journalism and marry a mild-mannered insurance salesman, Walter tries to draw her back into reporting a sensational case. Their newsroom maneuvering puts Hildy’s new plans—and the former couple’s relationship—to the test.
- Poster asset: `client/public/posters/his-girl-friday.webp`; reference: [IMDb image-search result](https://files.manuscdn.com/search-media/310519664020691393/UXq8UgPtQ2Nkr5hYqbKk0C/odNhPnDaSJqAyPDbSZKDHU.jpg).
- Metadata sources: [1](https://catalog.afi.com/Film/4331-His-Girl-Friday); [2](https://silver.afi.com/movies/detail/0100000459); [3](https://www.bfi.org.uk/film/0d4c9eca-4d30-5ce0-b5ba-975b099f1dec/his-girl-friday).
- In-room media URL: [public-domain](https://upload.wikimedia.org/wikipedia/commons/f/fb/His_Girl_Friday_%281940%29.webm) (supported direct-media or YouTube URL).
- Playback/source evidence: [https://commons.wikimedia.org/wiki/File:His_Girl_Friday_(1940).webm](https://commons.wikimedia.org/wiki/File:His_Girl_Friday_(1940).webm).
- Rights note: Wikimedia Commons identifies the film as U.S. public domain based on non-renewal, but cautions it may remain protected where the rule of the shorter term is not applied. No worldwide rights clearance is implied.
- Research embed status: `not-verifiable`; no positive embed conclusion is drawn.
- Verification notes: AFI Catalog confirms 1940, 92 minutes, Comedy and Screwball comedy; AFI Silver independently lists U.S., 1940, 92 minutes and Romantic comedy. BFI confirms 92 minutes but labels it 1939, a year discrepancy; AFI’s dated catalog record supports the 1940 release year. The selected Wikimedia Commons page identifies a full-length video and displays the U.S. public-domain rationale; embedding on third-party sites was not independently confirmed. The supplied YouTube URL was not attributed to this film.

### Detour (1945)

- Runtime: 69 minutes; industry: Hollywood; primary genre: Film Noir; genres: Film Noir, Crime, Thriller.
- Synopsis: A down-on-his-luck New York pianist hitchhiking to Hollywood takes on a dead driver’s identity, only to encounter a hitchhiker whose knowledge of the driver puts him in an increasingly precarious position.
- Poster asset: `client/public/posters/detour.webp`; reference: [Posteritati image-search result](https://files.manuscdn.com/search-media/310519664020691393/UXq8UgPtQ2Nkr5hYqbKk0C/5ewMubJoEqadLYoC3ABtLd.jpg).
- Metadata sources: [1](https://silver.afi.com/movies/detail/0100000248); [2](https://www.janusfilms.com/films/1906); [3](https://www.criterion.com/films/29614-detour); [4](https://www.tcm.com/articles/70907/detour-1945).
- In-room media URL: none verified. The host can add a supported YouTube or direct HTTPS media URL, but this catalog record is not itself represented as playable.
- Verification notes: Metadata cross-checked against AFI Silver, Janus Films, Criterion, and TCM. AFI, Janus, and Criterion list 69 minutes; TCM lists 68, so 69 is used based on agreement among the official AFI/Janus/Criterion records. Internet Archive has a full-film item at https://archive.org/details/detour1945HD, labeled there with a Public Domain Mark by the uploader, but the page identifies an individual uploader and provides no independently verified title-specific rights evidence. Because the user’s policy requires credible evidence of public-domain status in a stated jurisdiction (not age alone), that copy is not treated as a qualifying source. No official full-film public-playback source was verified. The separate user-supplied YouTube URL was not attributed to this film.

### House on Haunted Hill (1959)

- Runtime: 75 minutes; industry: Hollywood; primary genre: Horror; genres: Horror, Thriller, Mystery.
- Synopsis: Eccentric millionaire Frederick Loren invites five strangers to spend a night in a reputedly haunted mansion, offering each $10,000 if they stay until morning. As unsettling events and suspicions mount, the guests try to determine whether the danger is supernatural—or part of a human scheme.
- Poster asset: `client/public/posters/house-on-haunted-hill.webp`; reference: [IMDb image-search result](https://files.manuscdn.com/search-media/310519664020691393/UXq8UgPtQ2Nkr5hYqbKk0C/5oSweAEAGpHGCEd88Cqn54.jpg).
- Metadata sources: [1](https://catalog.afi.com/Catalog/moviedetails/52597); [2](https://www.tcm.com/watchtcm/titles/78581); [3](https://www.sala46films.com/catalogue/house-on-haunted-hill/1959); [4](https://www.imdb.com/title/tt0051744/).
- In-room media URL: none verified. The host can add a supported YouTube or direct HTTPS media URL, but this catalog record is not itself represented as playable.
- Verification notes: AFI confirms 75 minutes and horror, but catalogs a December 1958 release; TCM and the Sala46 catalogue identify the film as 1959, which is the requested title-year designation and is also consistent with IMDb’s U.S. release date. Internet Archive has a full-length file listed at 4,494.57 seconds, but it is an uploader-posted copy with a user-supplied public-domain label, not a rights-holder source; given the reported U.S. renewal, it is not treated as a qualifying playback source. TCM’s film page provides metadata but did not establish publicly accessible full-film playback. The supplied YouTube URL was not attributed to this title.

### The Little Shop of Horrors (1960)

- Runtime: 70 minutes; industry: Hollywood; primary genre: Horror Comedy; genres: Horror Comedy, Comedy, Horror.
- Synopsis: On Los Angeles’ Skid Row, an awkward florist’s assistant introduces a strange plant he has cultivated. As the plant draws customers to the struggling shop, Seymour discovers its unusual appetite—and the demands it makes threaten to upend his life.
- Poster asset: `client/public/posters/little-shop-of-horrors.webp`; reference: [IMDb image-search result](https://files.manuscdn.com/search-media/310519664020691393/UXq8UgPtQ2Nkr5hYqbKk0C/QUdWmjqGDhfyqu2G4vkcMd.jpg).
- Metadata sources: [1](https://catalog.afi.com/Catalog/moviedetails/53212); [2](https://silver.afi.com/movies/detail/0100005023).
- In-room media URL: none verified. The host can add a supported YouTube or direct HTTPS media URL, but this catalog record is not itself represented as playable.
- Verification notes: AFI Catalog lists September 1960, 70 minutes, and Comedy/Horror; AFI Silver independently confirms the 1960 title and horror-comedy genre but lists a 72-minute restoration, so the catalog’s 70-minute record is used. Internet Archive pages offer complete playable copies and label them Public Domain Mark or CC0, but these are uploader-supplied labels rather than authoritative rights determinations. AFI Catalog says the film was not copyrighted at release yet records a 1985 registration to Santa Clara Productions; the material reviewed does not establish current public-domain status in a specific jurisdiction or official distribution rights. Therefore no playback source qualifies under the requested policy. The supplied YouTube URL resolves to Mrwhosetheboss’s 21-minute technology video, not this film.

### Plan 9 from Outer Space (1959)

- Runtime: 79 minutes; industry: Hollywood; primary genre: Science Fiction; genres: Science Fiction, Horror.
- Synopsis: When extraterrestrials fear humanity’s development of a world-threatening weapon, they launch a plan to cause chaos by reanimating the dead. Residents and authorities investigate the strange events linked to flying saucers over California.
- Poster asset: `client/public/posters/plan-9-from-outer-space.webp`; reference: [IMDb image-search result](https://files.manuscdn.com/search-media/310519664020691393/UXq8UgPtQ2Nkr5hYqbKk0C/vTu49VshjKqnbsGEZNPpMB.jpg).
- Metadata sources: [1](https://catalog.afi.com/Catalog/moviedetails/52989); [2](https://www.belcourt.org/films/plan-9-from-outer-space/); [3](https://enzian.org/index.php/film/plan-9-from-outer-space).
- In-room media URL: none verified. The host can add a supported YouTube or direct HTTPS media URL, but this catalog record is not itself represented as playable.
- Verification notes: AFI Catalog and cinema listings identify the theatrical release as 1959 (July 1959 per AFI), rather than 1957; 1957 appears in some listings as a production-era label. Runtime listings vary: Belcourt and Enzian list 79 minutes, while AFI gives 76 or 78 minutes and SIFF 80; 79 minutes is used here based on two cinema listings. AFI classifies it as horror and science fiction. A complete 79-minute file is hosted on Wikimedia Commons, whose page asserts U.S. public-domain status, but that same page describes 1981 registration and an asserted 1986 copyright renewal, then presents an uploader-supplied argument disputing the renewal's validity. With that material conflict and no independently verified authoritative resolution of U.S. rights, the Commons file is not treated as a qualifying source; no playback URL is supplied. The Commons page also warns rights may differ outside the United States. The provided YouTube URL was not attributed to this film.

### Reefer Madness (1936)

- Runtime: 66 minutes; industry: Hollywood; primary genre: Drama; genres: Drama, Crime, Melodrama.
- Synopsis: A school lecture about marijuana sets the stage for a melodramatic cautionary tale in which a group of teenagers encounter a local drug ring and face escalating personal and legal consequences.
- Poster asset: `client/public/posters/reefer-madness.webp`; reference: [eBay poster listing image-search result](https://files.manuscdn.com/search-media/310519664020691393/UXq8UgPtQ2Nkr5hYqbKk0C/qV5VAMJo26qdhU7jGuZvNm.jpg).
- Metadata sources: [1](https://www.tcm.com/watchtcm/titles/87909); [2](https://catalog.afi.com/Film/7885-TELL-YOUR-CHILDREN?cxt=filmography); [3](https://www.americangenrefilm.com/theatrical-film-catalog/reefer-madness-roadshow-version/).
- In-room media URL: none verified. The host can add a supported YouTube or direct HTTPS media URL, but this catalog record is not itself represented as playable.
- Verification notes: TCM lists 1936, 66 minutes, Crime/Drama; AFI’s catalog entry for the original title Tell Your Children gives 62 or 65–66 minutes and notes the later 1947 re-release as Reefer Madness. AGFA also catalogs Reefer Madness as a 1936 film, but lists a 76-minute 2K presentation, so runtime depends on print/version; 66 minutes is supported by TCM and AFI. Internet Archive provides a publicly playable full-length 68:17 item with an embed iframe, but its upload is attributed to an unknown uploader. The Public Domain Review labels the underlying work public domain in the U.S. while explicitly marking digital-copy rights unclear. Because the specific hosted copy’s rights are not established to the requested standard, no playback URL is included; no worldwide rights conclusion is implied.

### Charade (1963)

- Runtime: 113 minutes; industry: Hollywood; primary genre: Mystery; genres: Mystery, Comedy, Romance, Thriller.
- Synopsis: After her husband is found dead, Regina Lampert discovers that several men are pursuing a missing wartime fortune. With the help of the charming but enigmatic Peter Joshua, she tries to work out whom she can trust amid shifting identities and danger in Paris.
- Poster asset: `client/public/posters/charade.webp`; reference: [eBay poster listing image-search result](https://files.manuscdn.com/search-media/310519664020691393/UXq8UgPtQ2Nkr5hYqbKk0C/tzAqfNA3JxRHkpZbgFLAgQ.jpg).
- Metadata sources: [1](https://www.bfi.org.uk/film/2a8ee010-4ec0-5eee-aafe-45f18c31ce4e/charade); [2](https://silver.afi.com/movies/detail/0100004644); [3](https://www.rottentomatoes.com/m/1003883-charade).
- In-room media URL: [public-domain](https://upload.wikimedia.org/wikipedia/commons/d/dc/Charade_%281963%29.webm) (supported direct-media or YouTube URL).
- Playback/source evidence: [https://commons.wikimedia.org/wiki/File:Charade_(1963).webm](https://commons.wikimedia.org/wiki/File:Charade_(1963).webm).
- Rights note: Wikimedia Commons identifies the film as public domain in the United States due to a defective 1963 notice. This U.S.-specific basis does not establish copyright status elsewhere.
- Research embed status: `not-verifiable`; no positive embed conclusion is drawn.
- Verification notes: The Commons file page provides an in-page playable WebM identified as Charade (1963), with a listed duration of 1 hour 53 minutes 24 seconds, consistent with the 113-minute catalog runtime. Its licensing section and linked extracted notice image provide the stated U.S. public-domain basis; the Copyright Office circular supports the general rule, not the film-specific conclusion. Embedding was not independently confirmed, so embed_status is not-verifiable. Metadata cross-check: BFI and AFI Silver each list 1963 and 113 minutes; AFI describes it as mystery comedy, and Rotten Tomatoes lists mystery/thriller, comedy, romance.

### The Last Man on Earth (1964)

- Runtime: 86 minutes; industry: Hollywood; primary genre: Science Fiction; genres: Science Fiction, Horror, Post-apocalyptic.
- Synopsis: After a plague turns much of humanity into vampires, scientist Robert Morgan—apparently immune—survives alone in a devastated world, defending himself by day and searching for signs of other survivors.
- Poster asset: `client/public/posters/the-last-man-on-earth.webp`; reference: [IMDb image-search result](https://files.manuscdn.com/search-media/310519664020691393/UXq8UgPtQ2Nkr5hYqbKk0C/qwMsgnAZVrS7rm39pYejoU.jpg).
- Metadata sources: [1](https://catalog.afi.com/Catalog/MovieDetails/23303?cxt=filmography); [2](https://www.imdb.com/title/tt0058700/).
- In-room media URL: [public-domain](https://archive.org/download/lastmanonearth-1964/lastmanonearth-1964.mp4) (supported direct-media or YouTube URL).
- Playback/source evidence: [https://commons.wikimedia.org/wiki/File:The_Last_Man_on_Earth_(1964)_by_Ubaldo_Ragona_and_Sidney_Salkow.webm](https://commons.wikimedia.org/wiki/File:The_Last_Man_on_Earth_(1964)_by_Ubaldo_Ragona_and_Sidney_Salkow.webm).
- Rights note: Wikimedia Commons identifies the film as U.S. public domain because its 1963 copyright was not renewed. This is U.S.-only and does not determine rights in other jurisdictions.
- Research embed status: `not-verifiable`; no positive embed conclusion is drawn.
- Verification notes: AFI confirms the 1964 release and 86-minute runtime; IMDb independently lists 1964 and 1h 26m. Internet Archive provides a public video item with an HTML5 player and MP4; its metadata reports 5,223 seconds (about 87 minutes), and the MP4 URL responded with HTTP 206 for a byte-range request. The separate Commons file page reports a complete 1h 26m 47s feature. The public-domain rationale is not an official rights-holder statement, and embed playback was not independently tested.

## Bollywood

### 3 Idiots (2009)

- Runtime: 171 minutes; industry: Bollywood; primary genre: Comedy; genres: Comedy, Drama, Coming-of-age.
- Synopsis: Two friends reunite years after college and search for their elusive classmate Rancho, recalling how his independent spirit challenged the pressures of their engineering school and changed their lives.
- Poster asset: `client/public/posters/three-idiots.jpg`; reference: [film poster reference](https://www.imdb.com/title/tt1187043/).
- Metadata sources: [1](https://vinodchoprafilms.com/movies/3-idiots/); [2](https://tv.apple.com/in/movie/3-idiots/umc.cmc.7c2srvr0qpnqcxrdf23lhl9gi); [3](https://www.rottentomatoes.com/m/3_idiots).
- In-room media URL: none verified. The host can add a supported YouTube or direct HTTPS media URL, but this catalog record is not itself represented as playable.
- Verification notes: The rights-holder's official Vinod Chopra Films page verifies the film identity, synopsis, credits, and 25 December 2009 release date. Apple TV and Rotten Tomatoes list a 2h 51m runtime (171 minutes); IMDb lists 170 minutes, so runtime reporting differs by one minute among metadata sources. The rights-holder's official YouTube playlist was opened and its 27 entries are clips, songs, behind-the-scenes material, and a trailer—not the complete feature. Apple TV is a commercial listing, not a publicly playable full-film source. No qualifying publicly playable full film or public-domain evidence was found; unofficial uploads were excluded. No embed check applies to a qualifying source. The user-supplied YouTube URL was not attributed to this title.

### Dangal (2016)

- Runtime: 161 minutes; industry: Bollywood; primary genre: Drama; genres: Drama, Biography, Sports.
- Synopsis: Former wrestler Mahavir Singh Phogat sets out to pursue his long-held wrestling ambition by training his daughters, Geeta and Babita, challenging expectations about girls and sport along the way.
- Poster asset: `client/public/posters/dangal.jpg`; reference: [film poster reference](https://akpfilms.com/films/dangal/).
- Metadata sources: [1](https://www.imdb.com/title/tt5074352/); [2](https://www.netflix.com/title/80166185); [3](https://www.youtube.com/watch?v=x_7YlGv9u1g); [4](https://www.britannica.com/topic/Dangal-2016-film).
- In-room media URL: none verified. The host can add a supported YouTube or direct HTTPS media URL, but this catalog record is not itself represented as playable.
- Verification notes: IMDb identifies the film as a 2016 title, lists 2h 41m (161 min), and supplies biography/drama/sport facets; Netflix independently lists the 2016 title and synopsis and identifies drama. The 140-minute runtime shown on IMDb's technical page is a separate Mainland China cut, not the standard version. No qualifying publicly playable complete-film source was verified: Netflix is a subscription listing, and the official UTV Motion Pictures YouTube page opened here is a 3:26 promotional trailer, not the film. The provided YouTube URL resolves to Mrwhosetheboss's 2025 video “I bought the LAZIEST Tech ever,” not Dangal. No public-domain evidence or jurisdiction was established. Therefore playback_url is null; no source is represented as a verified full-film source.

### Lagaan: Once Upon a Time in India (2001)

- Runtime: 224 minutes; industry: Bollywood; primary genre: Drama; genres: Drama, Sports, Period, Musical.
- Synopsis: In 1890s India, a heavily taxed village faces drought and hardship. When a British officer proposes settling the dispute through a cricket match, farmer Bhuvan rallies his neighbors to take on the challenge and risk their future.
- Poster asset: `client/public/posters/lagaan.jpg`; reference: [film poster reference](https://www.imdb.com/title/tt0169102/).
- Metadata sources: [1](https://www.bfi.org.uk/film/c1155083-22b7-5a5d-8387-9bdae45b4e91/lagaan); [2](https://www.imdb.com/title/tt0169102/); [3](https://www.netflix.com/title/60020906); [4](https://www.justwatch.com/us/movie/lagaan-once-upon-a-time-in-india).
- In-room media URL: none verified. The host can add a supported YouTube or direct HTTPS media URL, but this catalog record is not itself represented as playable.
- Verification notes: BFI's catalog confirms 2001 and a 224-minute running time; IMDb corroborates year, runtime, plot, and genre tags. Netflix provides the synopsis and genre facets but reports the title is not available to watch in the observed country; JustWatch's US listing says it is not currently available to stream and lists a DVD purchase option only. The official Aamir Khan Talkies channel page contains promotional clips and an official re-release trailer, not a complete film. The exact supplied YouTube URL resolves to Mrwhosetheboss's 21-minute video 'I bought the LAZIEST Tech ever,' not Lagaan. No qualifying publicly playable official full-film source or jurisdiction-specific public-domain evidence was established; no playback URL is supplied. Embedding was not verified.

### Andhadhun (2018)

- Runtime: 139 minutes; industry: Bollywood; primary genre: Crime Thriller; genres: Crime Thriller, Crime, Mystery, Thriller, Dark Comedy.
- Synopsis: A pianist who presents himself as visually impaired becomes entangled in a murder and a dangerous web of secrets, forcing him to navigate a situation he can barely see coming.
- Poster asset: `client/public/posters/andhadhun.jpg`; reference: [film poster reference](https://www.imdb.com/title/tt8108198/).
- Metadata sources: [1](https://www.rottentomatoes.com/m/andhadhun); [2](https://www.imdb.com/title/tt8108198/); [3](https://www.netflix.com/title/81039381).
- In-room media URL: [official](https://www.youtube.com/watch?v=YpgAvVNa92Y) (supported direct-media or YouTube URL).
- Playback/source evidence: [https://www.youtube.com/watch?v=YpgAvVNa92Y](https://www.youtube.com/watch?v=YpgAvVNa92Y).
- Rights note: The full-film YouTube upload is on Star Studios Premiere, with channel/video attribution to Viacom18 Studios. Official-source classification only; playback and licensing may vary by territory.
- Research embed status: `not-verifiable`; no positive embed conclusion is drawn.
- Verification notes: Fetched the actual video and channel pages: the video is titled for Andhadhun, runs 2:12:34, and its transcript spans the feature's story through its conclusion. The listed metadata runtime is 139 minutes; the upload duration differs, though the source appears to include the complete plot. A direct embed-endpoint check returned YouTube Error 153 (player configuration error), so embedding could not be confirmed. The Netflix page currently reports country-dependent unavailability; that does not affect the separately accessible YouTube source.

### Awaara (1951)

- Runtime: 193 minutes; industry: Bollywood; primary genre: Drama; genres: Drama, Crime, Musical, Romance.
- Synopsis: A young man raised in poverty is drawn toward crime, while a childhood bond and a stern judge’s beliefs about heredity and justice intertwine their lives.
- Poster asset: `client/public/posters/awaara.webp`; reference: [IMDb image-search result](https://files.manuscdn.com/search-media/310519664020691393/UXq8UgPtQ2Nkr5hYqbKk0C/ty4oaiLF4afb3zJDHrjcgc.jpg).
- Metadata sources: [1](https://www.bfi.org.uk/film/286c5d60-7a54-5f92-b35e-76cb39e8ebd1/awaara); [2](https://tiff.net/events/awara); [3](https://www.tcm.com/articles/27950/awaara).
- In-room media URL: none verified. The host can add a supported YouTube or direct HTTPS media URL, but this catalog record is not itself represented as playable.
- Verification notes: BFI lists 1951 and a 193-minute running time; TIFF independently confirms 1951 and describes the film as drama, musical and romance, while TCM identifies its crime-drama elements. Runtime differs across catalogues/restorations (TIFF lists 177m; TCM 169m), so 193m follows BFI. Shemaroo’s official YouTube channel has a full-film Awaara page (https://www.youtube.com/watch?v=V88h_NvPIKU), identifying its full-movie channel and showing a 2:43:39 upload, but the fetched watch page reported “Video unavailable.” Therefore present public playability could not be confirmed and no playback URL is supplied. The YouTube embed page returned metadata but did not establish working playback or embedding; embed status is not verifiable. No public-domain claim is made.

### Pyaasa (1957)

- Runtime: 139 minutes; industry: Bollywood; primary genre: Drama; genres: Drama, Musical, Romance.
- Synopsis: In post-independence Calcutta, struggling poet Vijay fights to have his work recognized in a world that seems indifferent to it. Gulabo, a woman who discovers and admires his poems, becomes an unexpected source of support as he seeks a chance to publish them.
- Poster asset: `client/public/posters/pyaasa.webp`; reference: [CineMaterial image-search result](https://files.manuscdn.com/search-media/310519664020691393/UXq8UgPtQ2Nkr5hYqbKk0C/fKaHXjBYy3w5MsXv5G9Jkf.jpg).
- Metadata sources: [1](https://www.bfi.org.uk/film/1425457e-7c52-5827-8a84-ac27ec7810bb/pyaasa); [2](https://indiancinema.sites.uiowa.edu/pyaasa).
- In-room media URL: [official](https://www.youtube.com/watch?v=WJK45r-j6TU) (supported direct-media or YouTube URL).
- Playback/source evidence: [https://www.youtube.com/watch?v=WJK45r-j6TU](https://www.youtube.com/watch?v=WJK45r-j6TU).
- Rights note: Ultra Movie Parlour is identified as Ultra Media & Entertainment’s channel; reports identify Ultra as Pyaasa’s negative-rights owner. Official-source classification only; territorial availability may vary.
- Research embed status: `verified` (at the time checked).
- Verification notes: The BFI identifies the 1957 film and describes its story; the University of Iowa’s Indian Cinema entry specifies 139 minutes and documents its musical and romantic elements. The YouTube page identifies the upload as Pyaasa Full Movie, the full-film transcript is present, and a Commons import record for this exact upload lists a duration of 2 h 22 min 53 s. The YouTube embed URL resolved to a player page with the film title and transcript, without an embed-block notice. The Commons page itself flags its public-domain license claim as not yet reviewed, so it was not relied on for rights status.

### Mughal-e-Azam (1960)

- Runtime: 197 minutes; industry: Bollywood; primary genre: Historical Drama; genres: Historical Drama, Romance, Epic.
- Synopsis: At Emperor Akbar’s Mughal court, Prince Saleem falls in love with Anarkali, a court dancer. Their romance puts his personal desires at odds with his father’s expectations and imperial duty.
- Poster asset: `client/public/posters/mughal-e-azam.webp`; reference: [IMDb image-search result](https://files.manuscdn.com/search-media/310519664020691393/UXq8UgPtQ2Nkr5hYqbKk0C/quXCnCLPNVbcjPjEkgL4Tm.jpg).
- Metadata sources: [1](https://www.bbc.co.uk/films/2002/10/11/mughal_e_azam_1960_review.shtml); [2](https://tv.apple.com/in/movie/mughal-e-azam/umc.cmc.q4ot2a5tffuad3u6j9dso1nt); [3](https://www.britannica.com/topic/Mughal-e-Azam); [4](https://asiasociety.org/new-york/events/sold-out-mughal-e-azam).
- In-room media URL: none verified. The host can add a supported YouTube or direct HTTPS media URL, but this catalog record is not itself represented as playable.
- Verification notes: BBC, Apple TV, and Asia Society support the 1960 release and a 197-minute runtime; the BFI lists 173 minutes, while ShemarooMe lists 3h 16m 44s, indicating differing listed versions/runtimes. No qualifying public playback source could be verified. A full-film video appears on the Zee Music Company YouTube channel (https://www.youtube.com/watch?v=BGL6zt5fs0c), but the fetched watch page reports “Video unavailable”; the page/channel evidence reviewed did not establish Zee as authorized for this film’s video rights. ShemarooMe lists the full movie but routes access through subscription/purchase and presents regional/account restrictions, so it is not a public playable source under the requested policy. No public-domain evidence was found; the film’s age alone does not establish public-domain status. The supplied youtu.be URL was not attributed to the film without evidence. YouTube embedding was not confirmed.

### Do Aankhen Barah Haath (1957)

- Runtime: 144 minutes; industry: Bollywood; primary genre: Drama; genres: Drama, Crime, Comedy.
- Synopsis: An idealistic prison warden takes six hardened prisoners to work on a rural farm, betting that trust, responsibility, and hard work can help them build new lives outside prison.
- Poster asset: `client/public/posters/do-aankhen-barah-haath.webp`; reference: [IMDb image-search result](https://files.manuscdn.com/search-media/310519664020691393/UXq8UgPtQ2Nkr5hYqbKk0C/UeZkMj5KsnsvBcJqjtrLQo.jpg).
- Metadata sources: [1](https://www.shemaroome.com/movies/do-ankhen-barah-haath); [2](https://artsandculture.google.com/asset/poster-of-film-do-aankhen-barah-haath/7wGMy9An78N0zw?hl=en); [3](https://www.imdb.com/title/tt0050322/).
- In-room media URL: [official](https://www.youtube.com/watch?v=UGMN2X9knUI) (supported direct-media or YouTube URL).
- Playback/source evidence: [https://www.youtube.com/watch?v=UGMN2X9knUI](https://www.youtube.com/watch?v=UGMN2X9knUI).
- Rights note: The full-film upload is on the self-described official Eagle Home Entertainments channel. This supports official-source classification, not public-domain status or worldwide licensing; embedding is not confirmed.
- Research embed status: `not-verifiable`; no positive embed conclusion is drawn.
- Verification notes: ShemarooMe gives the runtime as 02h 23m 42s (rounded to 144 minutes) and labels the film Comedy; IMDb lists 1957 and a 2h 23m runtime, and Google Arts & Culture's record contributed by the V. Shantaram Motion Picture Scientific Research and Cultural Foundation identifies the 1957 release. The YouTube watch page resolves to the titled full-movie upload on the Eagle Home Entertainments channel. Its embed URL returned YouTube error 153 in this check, so embedding could not be confirmed; this is not evidence that embedding is disabled.

### Guide (1965)

- Runtime: 183 minutes; industry: Bollywood; primary genre: Romantic Drama; genres: Romantic Drama, Romance, Drama, Musical.
- Synopsis: Tour guide Raju meets Rosie, a woman yearning to escape a stifling marriage and pursue dance. As he helps her build an independent life and career, their bond is tested by ambition, social expectations, and personal choices.
- Poster asset: `client/public/posters/guide.webp`; reference: [IMDb image-search result](https://files.manuscdn.com/search-media/310519664020691393/UXq8UgPtQ2Nkr5hYqbKk0C/HCEU2H5F2mmZzu4jhmDDWm.jpg).
- Metadata sources: [1](https://www.imdb.com/title/tt0059246/); [2](https://indiancinema.sites.uiowa.edu/guide); [3](https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=1959575).
- In-room media URL: [official](https://www.youtube.com/watch?v=lQ-OEq0k75c) (supported direct-media or YouTube URL).
- Playback/source evidence: [https://www.youtube.com/watch?v=lQ-OEq0k75c](https://www.youtube.com/watch?v=lQ-OEq0k75c).
- Rights note: The full-film upload is on Shemaroo Movies, identified as Shemaroo Entertainment’s full-length film channel. Official-source classification only; no worldwide licensing or region availability is asserted.
- Research embed status: `verified` (at the time checked).
- Verification notes: Opened the Shemaroo Movies watch page: its title identifies Guide (1965) as a full movie, the page shows a 2:46:52 video, and the channel description identifies Shemaroo Entertainment and its full-length-film channel. The YouTube oEmbed endpoint returned an iframe embed, and the /embed/lQ-OEq0k75c page resolved with the film title/player rather than an embedding restriction. Runtime sources vary: IMDb lists 3h 3m (183 minutes), University of Iowa lists 170 minutes, and the available upload runs 2:46:52; 183 minutes is returned as the cited theatrical runtime, with version/runtime variation noted.

### Anand (1971)

- Runtime: 122 minutes; industry: Bollywood; primary genre: Drama; genres: Drama, Tragedy, Musical.
- Synopsis: A cheerful man facing a terminal illness enters the life of a serious doctor, and his warmth and zest for living gradually transform the people around him.
- Poster asset: `client/public/posters/anand.webp`; reference: [IMDb image-search result](https://files.manuscdn.com/search-media/310519664020691393/UXq8UgPtQ2Nkr5hYqbKk0C/YJqM7ppDy9skKNakiGjnS.jpg).
- Metadata sources: [1](https://www.imdb.com/title/tt0066763/); [2](https://indiancinema.sites.uiowa.edu/anand); [3](https://www.primevideo.com/detail/0O728XHPT9EKFNPCHIDC41X32N).
- In-room media URL: [official](https://www.youtube.com/watch?v=nK_SmZrjMPU) (supported direct-media or YouTube URL).
- Playback/source evidence: [https://www.youtube.com/watch?v=nK_SmZrjMPU](https://www.youtube.com/watch?v=nK_SmZrjMPU).
- Rights note: The full-film upload is on NH Studioz, a film-rights and licensing company; IMDb lists it as worldwide distributor. Official-source classification only; playback and regional availability vary.
- Research embed status: `not-verifiable`; no positive embed conclusion is drawn.
- Verification notes: IMDb identifies the 1971 film, 122-minute runtime, and drama/tragedy/musical facets; University of Iowa describes it as about 122 minutes and provides corroborating film context; Prime Video independently lists 1971 and synopsis, though gives a shorter 1 h 56 min runtime. The NH Studioz YouTube watch page identifies the title as a full movie and shows a feature-length runtime of 1:55:06; this differs from the commonly catalogued 122-minute runtime, so versions may vary. The official upload page resolves, but embed testing returned YouTube error 153 (referer required), so embedding could not be confirmed. The separately supplied user URL was not used or attributed to this film.

### Bawarchi (1972)

- Runtime: 130 minutes; industry: Bollywood; primary genre: Comedy; genres: Comedy, Drama, Musical.
- Synopsis: When the quarrelsome Sharma family struggles to keep a cook, cheerful and remarkably capable Raghu joins their household. His kindness and many talents gradually ease tensions and bring the family closer together.
- Poster asset: `client/public/posters/bawarchi.webp`; reference: [IMDb image-search result](https://files.manuscdn.com/search-media/310519664020691393/UXq8UgPtQ2Nkr5hYqbKk0C/LjShrgZZM72PC2tm5j9p8V.jpg).
- Metadata sources: [1](https://www.imdb.com/title/tt0068257/); [2](https://www.primevideo.com/detail/0P9RCJYBOIDAV99VXUSEZ5MIP7?tr=in); [3](https://en.wikipedia.org/wiki/Bawarchi).
- In-room media URL: [official](https://www.youtube.com/watch?v=HNadSgtwAsc) (supported direct-media or YouTube URL).
- Playback/source evidence: [https://www.youtube.com/@nhprime](https://www.youtube.com/@nhprime).
- Rights note: NH Prime links to NH Studioz, a film-rights and licensing company; Prime Video names NH Studioz as studio. Official-source classification only; embedding and territory-specific licensing were not verified.
- Research embed status: `not-verifiable`; no positive embed conclusion is drawn.
- Verification notes: The YouTube page resolves as “Bawarchi 1972 Hindi Full Movie HD” and reports 1:54:53; NH Prime is linked to NH Studioz. The YouTube embed endpoint returned Error 153 in the available page check, which does not establish whether embedding is enabled, so embed status is not-verifiable. Runtime sources differ: IMDb and the reference listing report 130 minutes, while the Prime Video title page lists 2 h 5 min; the uploaded video duration is shorter still, so runtime here follows the 130-minute IMDb/reference listing and should be understood as a catalog runtime, not a claim that this particular uploaded version runs that long. The user-supplied youtu.be link was not used or attributed to this film.

### Chupke Chupke (1975)

- Runtime: 146 minutes; industry: Bollywood; primary genre: Comedy; genres: Comedy, Drama, Romance.
- Synopsis: A newly married botany professor, amused by his wife’s admiration for her brother-in-law, disguises himself as a chauffeur and sets an elaborate practical joke in motion, with friends drawn into the ensuing misunderstandings.
- Poster asset: `client/public/posters/chupke-chupke.webp`; reference: [IMDb image-search result](https://files.manuscdn.com/search-media/310519664020691393/UXq8UgPtQ2Nkr5hYqbKk0C/fMa6L7TyLbNvc3sqPhhH3b.jpg).
- Metadata sources: [1](https://www.imdb.com/title/tt0072783/); [2](https://www.rottentomatoes.com/m/chupke-chupke); [3](https://tv.apple.com/us/movie/chupke-chupke/umc.cmc.40i9g7d5r5fepeq6cj3oxjyn8); [4](https://www.netflix.com/title/20255593).
- In-room media URL: none verified. The host can add a supported YouTube or direct HTTPS media URL, but this catalog record is not itself represented as playable.
- Verification notes: IMDb confirms India release date April 11, 1975, lists 2h 26m (146 min), and classifies the film as comedy, drama, and romance. Runtime listings conflict: Rotten Tomatoes says 2h 7m, Apple TV 2h 9m, Prime Video 2h 8m, and JustWatch reports 145 min for JioHotstar India; 146 minutes is the IMDb technical-spec listing, not a claim that all currently available cuts have this duration. Netflix and Apple pages corroborate year, comedy classification, and synopsis. JioHotstar is identified by IMDb/JustWatch as a regional streaming destination, but its page could not be verified as publicly playable from this environment; Prime Video says the title is currently unavailable. Search surfaced YouTube full-film uploads, but their rights-holder status was not established, so none qualifies under the requested policy. No credible public-domain evidence was found; no playback URL or rights claim is supplied. The user-provided YouTube URL was not attributed to the film because title/source identity was not verified. Embedding was not verified.

### Seeta Aur Geeta (1972)

- Runtime: 162 minutes; industry: Bollywood; primary genre: Comedy; genres: Comedy, Drama.
- Synopsis: Long-suffering Seeta, an heiress mistreated by her aunt, is separated from her twin Geeta, who grows up as a spirited street performer. When the sisters unexpectedly switch places, their very different lives—and the people around them—are upended.
- Poster asset: `client/public/posters/sita-aur-geeta.webp`; reference: [IMDb image-search result](https://files.manuscdn.com/search-media/310519664020691393/UXq8UgPtQ2Nkr5hYqbKk0C/Za4McfiNyYnyXUYkGmSWgY.jpg).
- Metadata sources: [1](https://www.nhstudioz.tv/movies/seeta-aur-geeta); [2](https://www.imdb.com/title/tt0078222/); [3](https://www.rottentomatoes.com/m/seeta-aur-geeta-seeta-and-geeta).
- In-room media URL: [official](https://www.youtube.com/watch?v=hZ5-XqyJ5oY) (supported direct-media or YouTube URL).
- Playback/source evidence: [https://www.nhstudioz.tv/movies/seeta-aur-geeta](https://www.nhstudioz.tv/movies/seeta-aur-geeta).
- Rights note: NH Studioz lists the film in its catalogue and its official YouTube channel hosts the full film. Official-source classification only; availability and rights may vary by territory.
- Research embed status: `verified` (at the time checked).
- Verification notes: The NH Studioz title page confirms 1972, 2h 42m (162 minutes), comedy/drama, and a synopsis. IMDb independently lists 1972, 2h 42m, and genre facets; Rotten Tomatoes also lists 1972 and 2h 42m. The selected YouTube page identifies the video as a full movie from NH Studioz; the video's oEmbed response names NH Studioz and supplies an iframe, and its embed endpoint responded successfully. The supplied separate URL was not used because no evidence established it as a qualifying source for this title.

### Gol Maal (1979)

- Runtime: 144 minutes; industry: Bollywood; primary genre: Comedy; genres: Comedy, Drama, Romance.
- Synopsis: An earnest young man lands a job with a strict, old-fashioned employer whose rules leave little room for personal interests. After being caught indulging in a forbidden hobby, he invents a twin brother to cover his tracks, setting off an increasingly complicated series of deceptions.
- Poster asset: `client/public/posters/gol-maal.webp`; reference: [IMDb image-search result](https://files.manuscdn.com/search-media/310519664020691393/UXq8UgPtQ2Nkr5hYqbKk0C/vtR8yFzRYgCUd7NwLeQphc.jpg).
- Metadata sources: [1](https://play.google.com/store/movies/details/Gol_Maal?id=NuJYhse3TIo&hl=en_US); [2](https://www.imdb.com/title/tt0079221/); [3](https://www.imdb.com/title/tt0079221/technical/); [4](https://www.netflix.com/title/21028086); [5](https://www.rottentomatoes.com/m/gol_maal).
- In-room media URL: [official](https://www.youtube.com/watch?v=9QHGQ11X8wc) (supported direct-media or YouTube URL).
- Playback/source evidence: [https://www.nhstudioz.tv/movies/gol-maal](https://www.nhstudioz.tv/movies/gol-maal).
- Rights note: NH Studioz/NH Movies identify the film with distributor rights evidence and host a full-film YouTube upload. Official-source classification only; territory-specific licensing and embedding are not confirmed.
- Research embed status: `not-verifiable`; no positive embed conclusion is drawn.
- Verification notes: Opened the NH Movies YouTube watch page: it resolves to a public video titled as the full film, with a displayed duration of 2:17:49 and film dialogue throughout. Attempted the YouTube embed URL, but it returned player configuration error 153 in this verification environment; embedding therefore could not be confirmed. Runtime is 144 minutes, consistent on Google Play and IMDb's India technical specification; the NH Studioz catalog page instead lists 2h40, while the upload duration is 2:17:49, so published runtimes/version lengths conflict. The supplied alternate URL was not attributed to this film.

### Nadiya Ke Paar (1982)

- Runtime: 149 minutes; industry: Bollywood; primary genre: Romance; genres: Romance, Drama, Musical.
- Synopsis: In a rural village across the river, lively Chandan and Gunja’s teasing acquaintance grows into love. A family tragedy and the obligations placed on them complicate their relationship and test their loyalties.
- Poster asset: `client/public/posters/nadiya-ke-paar.webp`; reference: [IMDb image-search result](https://files.manuscdn.com/search-media/310519664020691393/UXq8UgPtQ2Nkr5hYqbKk0C/nsPehumKDRCLLWjyMSgnsW.jpg).
- Metadata sources: [1](https://tv.apple.com/in/movie/nadiya-ke-paar/umc.cmc.6gitl3d2gbkd934x9fjmd50ex); [2](https://www.imdb.com/title/tt0256951/); [3](https://www.rottentomatoes.com/m/nadiya_ke_paar).
- In-room media URL: [official](https://www.youtube.com/watch?v=D4dsSqRuQsg) (supported direct-media or YouTube URL).
- Playback/source evidence: [https://www.youtube.com/watch?v=D4dsSqRuQsg](https://www.youtube.com/watch?v=D4dsSqRuQsg).
- Rights note: The Rajshri YouTube channel publishes the complete film, and Apple TV lists Rajshri Productions as studio. Official-source classification only; no worldwide reuse or embed availability is implied.
- Research embed status: `not-verifiable`; no positive embed conclusion is drawn.
- Verification notes: Opened the YouTube watch page: it identifies the uploader/channel as Rajshri, labels the title as the full movie, and reports a 2:29:57 video; transcript/content evidence is consistent with the film. The embed endpoint returned a player configuration error (153), so embedding availability could not be confirmed. Runtime listings differ: Apple TV reports 2 hr 29 min, consistent with the full upload length (149 minutes rounded); IMDb and Rotten Tomatoes report 2 hr 23 min (143 minutes). Used the Apple/official-upload-aligned runtime. Apple TV also gives 1982, a synopsis, Drama/Musical facets, and Rajshri Productions as studio; IMDb independently confirms year, Romance/Drama, director, and plot identification.
