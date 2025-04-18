/**
 * This is an empty module that serves as a replacement for the problematic
 * @radix-ui/react-use-effect-event module during build
 */

// Export a simple implementation that matches the original module's signature 
module.exports = function useEffectEvent(callback) {
  return callback;
};
