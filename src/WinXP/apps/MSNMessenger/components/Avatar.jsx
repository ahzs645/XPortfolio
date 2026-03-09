import React from 'react';
import { getAvatarPath, ASSET_PATH } from '../data/constants';

export default function Avatar({ image }) {
  return (
    <div className="avatar-container">
      <img className="avatar-picture" src={getAvatarPath(image)} alt="Avatar" />
      <button className="avatar-down">&#9660;</button>
      <img className="avatar-expand" src={`${ASSET_PATH}ui/expand-left.png`} alt="expand" />
    </div>
  );
}
