# blocks-clients
Lets you communicate with PIXILAB Blocks from web clients running in a browser. 
There are two flavors available, both essentially implementing the same API.

- **pub-sub-iframe** is applicable if your web page is designed to be hosted inside a Web Block in Blocks. 
  This piggybacks on the pub-sub behavior already provided by the host Blocks Spot.
- **pub-sub-peer** can be used if your web page runs outside of a Web Block. It opens its 
ownWebSocket connection to Blocks.

For more information on how to use these APIs see https://pixilab.se/docs/blocks/api/javascript
