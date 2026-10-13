let ioInstance = null;

export function initSocket(io) {
  ioInstance = io;
}

export function getIO() {
  return ioInstance;
}

export function emitToAdmin(event, data) {
  if (ioInstance) {
    ioInstance.to('admin_room').emit(event, data);
  }
}

export function emitToVendor(vendorId, event, data) {
  if (ioInstance) {
    ioInstance.to(`vendor_${vendorId}`).emit(event, data);
  }
}
