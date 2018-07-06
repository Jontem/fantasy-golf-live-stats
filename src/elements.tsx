import styled from "styled-components";

export const PlayerHeader = styled.h2`
  display: inline-block;
`;

export const DeletePlayer = styled.span`
  color: black;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

export const StatsTable = styled.table`
  table-layout: fixed;
  border: 1px solid purple;
  border-collapse: collapse;

  td,
  th {
    padding: 5px;
    text-align: center;
  }
`;

export const Points = styled.span`
  font-size: 14px;
`;
