import { Skeleton, styled } from '@mui/material';
import Img from 'next/image';
import useViewportSizes from 'use-viewport-sizes';
import { useObjectNavControls } from '@/hooks';
import { selectTextureDefs, selectTextureIndex, useAppSelector } from '@/store';

const Styled = styled('div')(
  ({ theme }) =>
    `& {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      align-items: center;
      justify-content: center;
    }
    
    & .texture-preview {
      transform: rotate(-90deg);
    }`
);

export default function TextureView() {
  useObjectNavControls();
  const [vpW] = useViewportSizes();
  const size = Math.round((vpW - 222) * 0.66);
  const textureIndex = useAppSelector(selectTextureIndex);
  const textureDefs = useAppSelector(selectTextureDefs);
  const textureUrl = textureDefs?.[textureIndex]?.dataUrls?.opaque;

  return (
    <Styled>
      {
        !textureUrl ? 
          <Skeleton className='texture-preview' variant='rectangular' width={size} height={size} /> : 
          <Img alt='texture preview' className='texture-preview' width={size} height={size} src={textureUrl} />
      }
    </Styled>
  );
}
